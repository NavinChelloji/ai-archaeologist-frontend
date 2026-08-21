import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, Input, FileTree, type FileNode, LoadingState, ErrorState } from "../../shared/components";
import { useFileTree } from "../../shared/hooks/useFileTree";
import styles from "./FolderStructurePage.module.css";

export function FolderStructurePage() {
  const { repoId } = useParams<{ repoId: string }>();
  const { data: fileTreeResponse, isLoading, error, refetch } = useFileTree(repoId ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | undefined>();

  const fileTree = useMemo(() => fileTreeResponse?.nodes ?? [], [fileTreeResponse?.nodes]);

  const filteredTree = useMemo(() => {
    if (!searchQuery) return fileTree;

    const filterNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes
        .filter((node) => node.name.toLowerCase().includes(searchQuery.toLowerCase()) || node.type === "folder")
        .map((node) => ({
          ...node,
          children: node.children ? filterNodes(node.children) : undefined,
        }))
        .filter((node) => node.type === "file" || (node.children && node.children.length > 0));
    };

    return filterNodes(fileTree);
  }, [searchQuery, fileTree]);

  const handleSelectFile = (node: FileNode) => {
    setSelectedFile(node.id);
  };

  if (isLoading) {
    return <LoadingState message="Loading file structure..." />;
  }

  if (error || !fileTree) {
    return (
      <ErrorState
        title="Failed to load file structure"
        message={error instanceof Error ? error.message : "Could not load file structure"}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Folder Structure</h1>
        <p className={styles.subtitle}>Browse the repository file structure</p>
      </div>

      <div className={styles.content}>
        <div className={styles.treePanel}>
          <Card className={styles.card}>
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon="🔍"
            />
          </Card>

          <Card className={styles.treeCard}>
            <FileTree data={filteredTree} selectedFile={selectedFile} onSelectFile={handleSelectFile} />
          </Card>
        </div>

        <div className={styles.detailPanel}>
          {selectedFile ? (
            <Card className={styles.detailCard}>
              <h3 className={styles.detailTitle}>File Details</h3>
              <div className={styles.detailContent}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>File ID:</span>
                  <span className={styles.detailValue}>{selectedFile}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Size:</span>
                  <span className={styles.detailValue}>2.5 KB</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Language:</span>
                  <span className={styles.detailValue}>TypeScript</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Last Modified:</span>
                  <span className={styles.detailValue}>2024-08-20</span>
                </div>
              </div>

              <div className={styles.detailActions}>
                <button className={styles.actionButton}>View File</button>
                <button className={styles.actionButton}>Ask AI</button>
              </div>
            </Card>
          ) : (
            <Card className={styles.emptyState}>
              <div className={styles.emptyIcon}>📁</div>
              <p className={styles.emptyText}>Select a file to view details</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
