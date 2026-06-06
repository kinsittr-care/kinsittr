"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NannyDocument } from "@/src/types/api/api";
import {
  deleteNannyDocument,
  listNannyDocuments,
  nannyDocumentsQueryKey,
  uploadNannyDocument,
} from "@/src/utils/api/nanny";
import { btnGhost, labelStyle } from "../nanny-styles";
import { N } from "../tokens";

const ACCEPTED_DOCUMENT_TYPES = ".pdf,.jpg,.jpeg,.png";
const MAX_DOCUMENTS = 5;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function NannyDocumentUploadSection() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const documentsQuery = useQuery({
    queryKey: nannyDocumentsQueryKey,
    queryFn: listNannyDocuments,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadNannyDocument,
    onSuccess: async () => {
      setSelectedFile(null);
      setError(null);
      await queryClient.invalidateQueries({ queryKey: nannyDocumentsQueryKey });
    },
    onError: (uploadError) => {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload document.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNannyDocument,
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: nannyDocumentsQueryKey });
    },
    onError: (deleteError) => {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete document.");
    },
  });

  const documents = documentsQuery.data?.data?.items ?? [];
  const uploadPending = uploadMutation.isPending;

  const handleFilesSelected = (files: FileList | null) => {
    if (!files?.length) return;

    const file = files[0];
    if (!allowedDocumentTypes.has(file.type)) {
      setError("Choose a PDF, JPG, or PNG document.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`${file.name} is larger than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const uploadSelectedFile = () => {
    if (!selectedFile) {
      setError("Choose a document before uploading.");
      return;
    }
    if (documents.length >= MAX_DOCUMENTS) {
      setError(`You can upload up to ${MAX_DOCUMENTS} documents.`);
      return;
    }
    uploadMutation.mutate(selectedFile);
  };

  return (
    <section
      className="mt-7 p-5 sm:p-7"
      style={{ background: N.card, border: `1px solid ${N.border}`, borderRadius: 18, boxShadow: N.shadow }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p style={labelStyle}>Screening documents</p>
          <h2 style={{ color: N.greenDk, fontSize: 22, fontWeight: 700, margin: 0 }}>
            Document upload
          </h2>
          <p style={{ color: N.inkMute, fontSize: 13.5, lineHeight: 1.7, marginTop: 8, maxWidth: 620 }}>
            Add identity, background check, CPR, or childcare certification documents for KinSittr review.
          </p>
        </div>

        <button
          className="w-full sm:w-auto"
          style={{ ...btnGhost, justifyContent: "center" }}
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose document
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_DOCUMENT_TYPES}
          style={{ display: "none" }}
          tabIndex={-1}
          onChange={(event) => {
            handleFilesSelected(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {selectedFile && (
        <div
          className="mt-5 flex flex-col gap-3 rounded-[14px] border p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: N.border, background: N.cardSoft }}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate" style={{ color: N.inkSoft, fontSize: 14, fontWeight: 700, margin: 0 }}>
              {selectedFile.name}
            </p>
            <p style={{ color: N.inkFaint, fontSize: 12.5, marginTop: 4 }}>
              {formatFileSize(selectedFile.size)} selected
            </p>
          </div>
          <button
            type="button"
            onClick={uploadSelectedFile}
            disabled={uploadPending}
            style={{
              ...btnGhost,
              background: N.green,
              borderColor: N.green,
              color: "#fff",
              justifyContent: "center",
              opacity: uploadPending ? 0.7 : 1,
            }}
          >
            {uploadPending ? "Uploading..." : "Upload document"}
          </button>
        </div>
      )}

      <div
        className="mt-5 rounded-[14px] border border-dashed p-4"
        style={{ borderColor: N.border, background: N.cardSoft }}
      >
        {documentsQuery.isLoading ? (
          <p style={{ color: N.inkFaint, fontSize: 13.5, margin: 0 }}>Loading documents...</p>
        ) : documentsQuery.isError ? (
          <p style={{ color: N.rose, fontSize: 13.5, margin: 0 }}>
            {documentsQuery.error instanceof Error ? documentsQuery.error.message : "Unable to load documents."}
          </p>
        ) : documents.length === 0 ? (
          <p style={{ color: N.inkFaint, fontSize: 13.5, margin: 0 }}>
            No documents selected yet. Accepted formats: PDF, JPG, PNG. Max {MAX_FILE_SIZE_MB}MB each.
          </p>
        ) : (
          <div className="space-y-3">
            {documents.map((document) => <DocumentRow key={document.id} document={document} isDeleting={deleteMutation.isPending} onDelete={deleteMutation.mutate} />)}
          </div>
        )}
      </div>

      {error && <p style={{ color: N.rose, fontSize: 13, fontWeight: 600, marginTop: 12 }}>{error}</p>}
      <p style={{ color: N.inkFaint, fontSize: 12.5, lineHeight: 1.6, marginTop: 12 }}>
        Uploaded documents are stored privately for KinSittr screening review.
      </p>
    </section>
  );
}

function DocumentRow({
  document,
  isDeleting,
  onDelete,
}: {
  document: NannyDocument;
  isDeleting: boolean;
  onDelete: (documentId: string) => void;
}) {
  return (
    <div
      className="flex flex-col gap-3 rounded-[12px] border p-3 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderColor: N.border, background: N.card }}
    >
      <div className="min-w-0 flex-1">
        <a
          className="block truncate"
          href={document.file_url}
          rel="noreferrer"
          target="_blank"
          style={{ color: N.inkSoft, fontSize: 14, fontWeight: 700, margin: 0 }}
        >
          {document.file_name}
        </a>
        <p style={{ color: N.inkFaint, fontSize: 12.5, marginTop: 4 }}>
          {formatFileSize(document.size_bytes)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDelete(document.id)}
        disabled={isDeleting}
        style={{ ...btnGhost, color: N.rose, justifyContent: "center", opacity: isDeleting ? 0.7 : 1 }}
      >
        Remove
      </button>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

const allowedDocumentTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
