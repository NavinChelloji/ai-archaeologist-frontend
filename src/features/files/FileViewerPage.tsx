import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, Badge, LoadingState, ErrorState, SyntaxHighlighter } from "../../shared/components";
import { useFileMetadata } from "../../shared/hooks/useFileContent";
import styles from "./FileViewerPage.module.css";

export function FileViewerPage() {
  const { fileId } = useParams<{ fileId: string }>();
  const { data: fileData, isLoading, error, refetch } = useFileMetadata(fileId ?? "");

  if (isLoading) {
    return <LoadingState message="Loading file..." />;
  }

  if (error || !fileData) {
    return (
      <ErrorState
        title="Failed to load file"
        message={error instanceof Error ? error.message : "Could not load file contents"}
        onRetry={() => refetch()}
      />
    );
  }

  const getLanguageIcon = (language: string | null): string => {
    if (!language) return "📄";
    const iconMap: Record<string, string> = {
      typescript: "📘",
      javascript: "📙",
      python: "🐍",
      java: "☕",
      go: "🐹",
      rust: "🦀",
      sql: "🗄️",
      json: "📋",
      yaml: "⚙️",
      html: "🌐",
      css: "🎨",
      markdown: "📝",
    };
    return iconMap[language.toLowerCase()] || "📄";
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.fileInfo}>
          <div className={styles.icon}>{getLanguageIcon(fileData.language)}</div>
          <div>
            <h1 className={styles.fileName}>{fileData.name}</h1>
            <p className={styles.filePath}>{fileData.path}</p>
          </div>
        </div>
        <div className={styles.metadata}>
          <Badge variant="primary">{fileData.language}</Badge>
          <span className={styles.size}>{(fileData.size / 1024).toFixed(1)} KB</span>
          <span className={styles.date}>{new Date(fileData.modifiedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Code Viewer */}
      <Card className={styles.codeCard}>
        <SyntaxHighlighter code={fileData.content} language={fileData.language} showLineNumbers={true} />
      </Card>

      {/* Details Panel */}
      <div className={styles.detailsGrid}>
        <Card className={styles.detailCard}>
          <h3 className={styles.detailTitle}>File Details</h3>
          <div className={styles.detailList}>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Lines:</span>
              <span className={styles.detailValue}>{fileData.lineCount}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Size:</span>
              <span className={styles.detailValue}>{(fileData.size / 1024).toFixed(1)} KB</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Language:</span>
              <span className={styles.detailValue}>{fileData.language}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Last Modified:</span>
              <span className={styles.detailValue}>{new Date(fileData.modifiedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        <Card className={styles.detailCard}>
          <h3 className={styles.detailTitle}>Symbols</h3>
          <div className={styles.symbolList}>
            {fileData.symbols && fileData.symbols.length > 0 ? (
              fileData.symbols.map((symbol, idx) => (
                <div key={idx} className={styles.symbol}>
                  <span className={styles.symbolIcon}>
                    {symbol.kind === "class" ? "🏗️" : symbol.kind === "function" ? "⚙️" : "📌"}
                  </span>
                  <span className={styles.symbolName}>{symbol.name}</span>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--clay-text-muted)", fontSize: "12px" }}>No symbols found</p>
            )}
          </div>
        </Card>

        <Card className={styles.detailCard}>
          <h3 className={styles.detailTitle}>Importers</h3>
          <div className={styles.importList}>
            {fileData.importers && fileData.importers.length > 0 ? (
              fileData.importers.map((importer, idx) => (
                <div key={idx} className={styles.import}>
                  <span className={styles.importIcon}>📄</span>
                  <span className={styles.importName}>{importer.name}</span>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--clay-text-muted)", fontSize: "12px" }}>No importers found</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
