'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function ExportButtons() {
  const exportToPdf = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const content = document.getElementById('playbook-content');
    if (content) {
      doc.html(content, {
        callback: function (doc) {
          doc.save('Adversarial-Playbook.pdf');
        },
        x: 10,
        y: 10,
        width: 180,
        windowWidth: 800,
      });
    }
  };

  const exportToWord = async () => {
    const { asBlob } = await import('html-to-docx');
    const { saveAs } = await import('file-saver');

    const contentElement = document.getElementById('playbook-content');
    if (contentElement) {
      const htmlString = `
        <!DOCTYPE html>
        <html>
        <head><title>Adversarial Playbook</title></head>
        <body>${contentElement.innerHTML}</body>
        </html>
      `;

      const data = await asBlob(htmlString);
      saveAs(data, 'Adversarial-Playbook.docx');
    }
  };

  return (
    <div className="flex items-center gap-2 pt-2">
      <Button onClick={exportToPdf} variant="outline" size="sm">
        <Download className="mr-2 h-3 w-3" /> PDF
      </Button>
      <Button onClick={exportToWord} variant="outline" size="sm">
        <Download className="mr-2 h-3 w-3" /> Word
      </Button>
    </div>
  );
}
