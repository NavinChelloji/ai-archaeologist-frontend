import { useState, useMemo } from "react";
import styles from "./FileTree.module.css";

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  size?: number;
  language?: string;
}

export interface FileTreeProps {
  data: FileNode[];
  onSelectFile?: (node: FileNode) => void;
  selectedFile?: string;
}

interface TreeNodeProps {
  node: FileNode;
  level: number;
  onSelectFile?: (node: FileNode) => void;
  selectedFile?: string;
}

function FileTreeNode({ node, level, onSelectFile, selectedFile }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.type === "folder" && node.children && node.children.length > 0;
  const isSelected = selectedFile === node.id;

  const handleClick = () => {
    if (node.type === "folder") {
      setIsExpanded(!isExpanded);
    } else {
      onSelectFile?.(node);
    }
  };

  const icon = node.type === "folder" ? (isExpanded ? "📂" : "📁") : getFileIcon(node.name, node.language);

  return (
    <div key={node.id} className={styles.nodeWrapper}>
      <div
        className={[styles.node, isSelected && styles.selected].filter(Boolean).join(" ")}
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={handleClick}
      >
        {hasChildren && (
          <span className={styles.expander}>
            {isExpanded ? "▼" : "▶"}
          </span>
        )}
        {!hasChildren && node.type === "folder" && <span className={styles.expander}></span>}
        <span className={styles.icon}>{icon}</span>
        <span className={styles.name}>{node.name}</span>
        {node.size && <span className={styles.size}>{formatFileSize(node.size)}</span>}
      </div>

      {isExpanded && hasChildren && (
        <div className={styles.children}>
          {node.children!.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelectFile={onSelectFile}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ data, onSelectFile, selectedFile }: FileTreeProps) {
  return (
    <div className={styles.container}>
      {data.map((node) => (
        <FileTreeNode
          key={node.id}
          node={node}
          level={0}
          onSelectFile={onSelectFile}
          selectedFile={selectedFile}
        />
      ))}
    </div>
  );
}

function getFileIcon(filename: string, language?: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  const iconMap: Record<string, string> = {
    ts: "📘",
    tsx: "⚛️",
    js: "📙",
    jsx: "⚛️",
    py: "🐍",
    java: "☕",
    go: "🐹",
    rs: "🦀",
    rb: "💎",
    php: "🐘",
    sql: "🗄️",
    json: "📋",
    yaml: "⚙️",
    yml: "⚙️",
    html: "🌐",
    css: "🎨",
    md: "📝",
    txt: "📄",
    env: "🔐",
    lock: "🔒",
  };

  return iconMap[ext] || "📄";
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
