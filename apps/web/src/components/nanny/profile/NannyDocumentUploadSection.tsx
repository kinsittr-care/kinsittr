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
import { btnGhostCls, labelCls } from "../nanny-styles";
import { cn } from "@/lib/utils";

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
    <section className="mt-7 p-5 sm:p-7 bg-nanny-card border border-nanny-border rounded-[18px] shadow-[var(--nanny-shadow)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={labelCls}>Screening documents</p>
          <h2 className="text-nanny-green-dk text-[22px] font-bold m-0">
            Document upload
          </h2>
          <p className="text-nanny-ink-faint text-[13.5px] leading-[1.7] mt-2 max-w-[620px]">
            Add identity, background check, CPR, or childcare certification documents for KinSittr review.
          </p>
        </div>

        <button
          className={cn(btnGhostCls, "w-full sm:w-auto justify-center")}
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose document
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_DOCUMENT_TYPES}
          className="hidden"
          tabIndex={-1}
          onChange={(event) => {
            handleFilesSelected(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {selectedFile && (
        <div className="mt-5 flex flex-col gap-3 rounded-[14px] border border-nanny-border bg-nanny-card-soft p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="truncate text-nanny-ink-soft text-[14px] font-bold m-0">
              {selectedFile.name}
            </p>
            <p className="text-nanny-ink-faint text-[12.5px] mt-1">
              {formatFileSize(selectedFile.size)} selected
            </p>
          </div>
          <button
            type="button"
            onClick={uploadSelectedFile}
            disabled={uploadPending}
            className={cn(btnGhostCls, "bg-nanny-green border-nanny-green text-white justify-center", uploadPending && "opacity-70")}
          >
            {uploadPending ? "Uploading..." : "Upload document"}
          </button>
        </div>
      )}

      <div className="mt-5 rounded-[14px] border border-dashed border-nanny-border bg-nanny-card-soft p-4">
        {documentsQuery.isLoading ? (
          <p className="text-nanny-ink-faint text-[13.5px] m-0">Loading documents...</p>
        ) : documentsQuery.isError ? (
          <p className="text-nanny-rose text-[13.5px] m-0">
            {documentsQuery.error instanceof Error ? documentsQuery.error.message : "Unable to load documents."}
          </p>
        ) : documents.length === 0 ? (
          <p className="text-nanny-ink-faint text-[13.5px] m-0">
            No documents selected yet. Accepted formats: PDF, JPG, PNG. Max {MAX_FILE_SIZE_MB}MB each.
          </p>
        ) : (
          <div className="space-y-3">
            {documents.map((document) => <DocumentRow key={document.id} document={document} isDeleting={deleteMutation.isPending} onDelete={deleteMutation.mutate} />)}
          </div>
        )}
      </div>

      {error && <p className="text-nanny-rose text-[13px] font-semibold mt-3 m-0">{error}</p>}
      <p className="text-nanny-ink-faint text-[12.5px] leading-[1.6] mt-3 mb-0">
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
    <div className="flex flex-col gap-3 rounded-[12px] border border-nanny-border bg-nanny-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <a
          className="block truncate text-nanny-ink-soft text-[14px] font-bold m-0"
          href={document.file_url}
          rel="noreferrer"
          target="_blank"
        >
          {document.file_name}
        </a>
        <p className="text-nanny-ink-faint text-[12.5px] mt-1 mb-0">
          {formatFileSize(document.size_bytes)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDelete(document.id)}
        disabled={isDeleting}
        className={cn(btnGhostCls, "text-nanny-rose justify-center", isDeleting && "opacity-70")}
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
