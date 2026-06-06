package pipes

import (
	"context"
	"log"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

const (
	documentFolder   = "nanny-documents"
	maxDocumentBytes = 10 * 1024 * 1024 // 10 MB
)

type UploadDocumentInput struct {
	FileName string
	Data     []byte
}

func (p *NannyPipe) ListDocuments(ctx context.Context, userID uuid.UUID) *shared.PipeRes[NannyDocumentListData] {
	if p.documentRepo == nil {
		return pipeDocumentError[NannyDocumentListData](messages.Document_Upload_Failed)
	}

	profile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil || profile.ID == uuid.Nil {
		return pipeDocumentError[NannyDocumentListData](messages.Nanny_Not_Found)
	}

	documents, err := p.documentRepo.ListNannyDocuments(ctx, profile.ID)
	if err != nil {
		log.Printf("nanny_documents_list_failed user_id=%s profile_id=%s err=%v", userID, profile.ID, err)
		return pipeDocumentError[NannyDocumentListData](messages.Document_Upload_Failed)
	}

	items := make([]NannyDocumentData, 0, len(documents))
	for _, document := range documents {
		items = append(items, nannyDocumentData(document))
	}

	return &shared.PipeRes[NannyDocumentListData]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Documents_Fetched),
		Data: &NannyDocumentListData{
			Items: items,
			Total: len(items),
		},
	}
}

func (p *NannyPipe) UploadDocument(ctx context.Context, userID uuid.UUID, input UploadDocumentInput) *shared.PipeRes[NannyDocumentData] {
	if p.cloudinary == nil || !p.cloudinary.Configured() {
		log.Printf("nanny_document_upload_failed user_id=%s result=cloudinary_not_configured", userID)
		return pipeDocumentError[NannyDocumentData](messages.Cloudinary_Not_Configured)
	}
	if p.documentRepo == nil {
		return pipeDocumentError[NannyDocumentData](messages.Document_Upload_Failed)
	}
	if len(input.Data) == 0 || strings.TrimSpace(input.FileName) == "" {
		return pipeDocumentError[NannyDocumentData](messages.Document_Invalid_File)
	}
	if len(input.Data) > maxDocumentBytes {
		return pipeDocumentError[NannyDocumentData](messages.Document_Too_Large)
	}

	mimeType := detectDocumentContentType(input.Data)
	resourceType := documentResourceType(mimeType)
	if resourceType == "" {
		log.Printf("nanny_document_upload_failed user_id=%s result=invalid_type content_type=%s", userID, mimeType)
		return pipeDocumentError[NannyDocumentData](messages.Document_Invalid_Type)
	}

	profile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil || profile.ID == uuid.Nil {
		return pipeDocumentError[NannyDocumentData](messages.Nanny_Not_Found)
	}

	documentID := uuid.New()
	publicID := profile.ID.String() + "/" + documentID.String()
	result, err := p.cloudinary.UploadFile(ctx, input.Data, documentFolder, publicID, sanitizeFileName(input.FileName), resourceType)
	if err != nil {
		log.Printf("nanny_document_upload_failed user_id=%s profile_id=%s result=provider_failed err=%v", userID, profile.ID, err)
		return pipeDocumentError[NannyDocumentData](messages.Document_Upload_Failed)
	}

	resourceType = result.ResourceType
	if resourceType == "" {
		resourceType = documentResourceType(mimeType)
	}

	document, err := p.documentRepo.CreateNannyDocument(ctx, models.NannyDocument{
		ID:             documentID,
		NannyProfileID: profile.ID,
		FileName:       sanitizeFileName(input.FileName),
		FileURL:        result.SecureURL,
		PublicID:       result.PublicID,
		ResourceType:   resourceType,
		MimeType:       mimeType,
		SizeBytes:      int64(len(input.Data)),
	})
	if err != nil || document.ID == uuid.Nil {
		log.Printf("nanny_document_upload_failed user_id=%s profile_id=%s result=record_failed err=%v", userID, profile.ID, err)
		_ = p.cloudinary.DeleteFile(ctx, result.PublicID, resourceType)
		return pipeDocumentError[NannyDocumentData](messages.Document_Upload_Failed)
	}

	log.Printf("nanny_document_upload_success user_id=%s profile_id=%s document_id=%s", userID, profile.ID, document.ID)
	data := nannyDocumentData(document)
	return &shared.PipeRes[NannyDocumentData]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Document_Uploaded),
		Data:    &data,
	}
}

func (p *NannyPipe) DeleteDocument(ctx context.Context, userID uuid.UUID, documentID uuid.UUID) *shared.PipeRes[any] {
	if p.cloudinary == nil || !p.cloudinary.Configured() {
		return pipeDocumentError[any](messages.Cloudinary_Not_Configured)
	}
	if p.documentRepo == nil {
		return pipeDocumentError[any](messages.Document_Delete_Failed)
	}

	profile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil || profile.ID == uuid.Nil {
		return pipeDocumentError[any](messages.Nanny_Not_Found)
	}

	document, err := p.documentRepo.GetNannyDocument(ctx, documentID, profile.ID)
	if err != nil {
		return pipeDocumentError[any](messages.Document_Delete_Failed)
	}
	if document.ID == uuid.Nil {
		return pipeDocumentError[any](messages.Document_Not_Found)
	}

	if err := p.cloudinary.DeleteFile(ctx, document.PublicID, document.ResourceType); err != nil {
		log.Printf("nanny_document_delete_failed user_id=%s profile_id=%s document_id=%s result=provider_failed err=%v", userID, profile.ID, document.ID, err)
		return pipeDocumentError[any](messages.Document_Delete_Failed)
	}
	if err := p.documentRepo.DeleteNannyDocument(ctx, documentID, profile.ID); err != nil {
		log.Printf("nanny_document_delete_failed user_id=%s profile_id=%s document_id=%s result=record_failed err=%v", userID, profile.ID, document.ID, err)
		return pipeDocumentError[any](messages.Document_Delete_Failed)
	}

	log.Printf("nanny_document_delete_success user_id=%s profile_id=%s document_id=%s", userID, profile.ID, document.ID)
	return &shared.PipeRes[any]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Document_Deleted),
	}
}

func pipeDocumentError[T any](message string) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{
		Success: false,
		Message: shared.CreatePipeMessage(message),
	}
}

func nannyDocumentData(document models.NannyDocument) NannyDocumentData {
	return NannyDocumentData{
		ID:           document.ID.String(),
		FileName:     document.FileName,
		FileURL:      document.FileURL,
		MimeType:     document.MimeType,
		SizeBytes:    document.SizeBytes,
		ResourceType: document.ResourceType,
		CreatedAt:    document.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

func detectDocumentContentType(data []byte) string {
	if len(data) == 0 {
		return ""
	}
	sniffLen := min(len(data), 512)
	return strings.ToLower(strings.SplitN(http.DetectContentType(data[:sniffLen]), ";", 2)[0])
}

func documentResourceType(mimeType string) string {
	switch mimeType {
	case "image/jpeg", "image/png":
		return "image"
	case "application/pdf":
		return "raw"
	default:
		return ""
	}
}

func sanitizeFileName(name string) string {
	name = strings.TrimSpace(filepath.Base(name))
	if name == "." || name == string(filepath.Separator) {
		return "document"
	}
	return name
}
