import { useQuery } from "@tanstack/react-query";
import { getFileContent, getFileMetadata } from "../api/files-api";

export function useFileContent(fileId: string) {
  return useQuery({
    queryKey: ["file", fileId, "content"],
    queryFn: () => getFileContent(fileId),
    enabled: !!fileId,
  });
}

export function useFileMetadata(fileId: string) {
  return useQuery({
    queryKey: ["file", fileId, "metadata"],
    queryFn: () => getFileMetadata(fileId),
    enabled: !!fileId,
  });
}
