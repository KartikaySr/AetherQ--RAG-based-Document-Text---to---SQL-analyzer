import { ChatMessage, Conversation } from "@/types/chat";

export const exportService = {
  messageToMarkdown(message: ChatMessage): string {
    const roleLabel = message.role === "user" ? "👤 You" : "🤖 AetherQ";
    const timestamp = message.timestamp
      ? new Date(message.timestamp).toLocaleString()
      : "";

    let md = `**${roleLabel}** _(${timestamp})_\n\n${message.content}\n\n`;

    if (message.chunks && message.chunks.length > 0) {
      md += `---\n**Sources:**\n`;
      message.chunks.forEach((chunk, idx) => {
        md += `\n${idx + 1}. [${(chunk.similarity * 100).toFixed(0)}% match]`;
        if (chunk.documentName) {
          md += ` from ${chunk.documentName}`;
        }
        md += `\n   > ${chunk.chunkText.substring(0, 200)}...\n`;
      });
      md += "\n";
    }

    if (message.sqlResult) {
      md += "---\n**Generated SQL**\n\n```sql\n";
      md += message.sqlResult.sql;
      md += "\n```\n\n";
    }

    return md;
  },

  conversationToMarkdown(conversation: Conversation): string {
    let md = `# ${conversation.title}\n\n`;
    md += `**Mode:** ${conversation.mode}\n`;
    md += `**Created:** ${new Date(conversation.createdAt).toLocaleString()}\n\n`;
    md += "---\n\n";

    conversation.messages.forEach((msg) => {
      md += this.messageToMarkdown(msg);
    });

    return md;
  },

  conversationToPlainText(conversation: Conversation): string {
    let text = `${conversation.title}\n`;
    text += `${"=".repeat(conversation.title.length)}\n\n`;
    text += `Mode: ${conversation.mode}\n`;
    text += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n\n`;
    text += "-".repeat(80) + "\n\n";

    conversation.messages.forEach((msg) => {
      const roleLabel = msg.role === "user" ? "YOU" : "AETHERQ";
      const timestamp = msg.timestamp
        ? new Date(msg.timestamp).toLocaleString()
        : "";

      text += `[${roleLabel}] ${timestamp}\n`;
      text += `-`.repeat(40) + "\n";
      text += msg.content + "\n\n";

      if (msg.sqlResult) {
        text += `SQL:\n${msg.sqlResult.sql}\n\n`;
      }

      if (msg.chunks && msg.chunks.length > 0) {
        text += "SOURCES:\n";
        msg.chunks.forEach((chunk, idx) => {
          text += `  ${idx + 1}. [${(chunk.similarity * 100).toFixed(0)}% match]`;
          if (chunk.documentName) {
            text += ` from ${chunk.documentName}`;
          }
          text += `\n     ${chunk.chunkText.substring(0, 150)}\n\n`;
        });
      }

      text += "\n";
    });

    return text;
  },

  downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  exportConversation(
    conversation: Conversation,
    format: "markdown" | "text"
  ): void {
    const timestamp = new Date().toISOString().split("T")[0];
    const sanitizedTitle = conversation.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    if (format === "markdown") {
      const md = this.conversationToMarkdown(conversation);
      this.downloadFile(
        md,
        `${sanitizedTitle}-${timestamp}.md`,
        "text/markdown"
      );
    } else {
      const txt = this.conversationToPlainText(conversation);
      this.downloadFile(
        txt,
        `${sanitizedTitle}-${timestamp}.txt`,
        "text/plain"
      );
    }
  },

  exportMessage(message: ChatMessage, format: "markdown" | "text"): void {
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `message-${timestamp}`;

    if (format === "markdown") {
      const md = this.messageToMarkdown(message);
      this.downloadFile(md, `${filename}.md`, "text/markdown");
    } else {
      let txt = message.content;
      if (message.sqlResult) {
        txt += `\n\nSQL:\n${message.sqlResult.sql}`;
      }
      if (message.chunks && message.chunks.length > 0) {
        txt += "\n\nSOURCES:\n";
        message.chunks.forEach((chunk, idx) => {
          txt += `${idx + 1}. ${chunk.chunkText.substring(0, 200)}\n`;
        });
      }
      this.downloadFile(txt, `${filename}.txt`, "text/plain");
    }
  },
};
