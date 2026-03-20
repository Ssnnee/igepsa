
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { Loader2, FileDown } from "lucide-react";

interface DocumentGeneratorProps {
    inspector: any;
    onBack: () => void;
}

const DOCUMENT_TYPES = [
    { id: "attestation_presence", label: "Attestation de présence au poste" },
    { id: "reprise_service", label: "Reprise de service" },
    { id: "cessation_service", label: "Cessation de service" },
] as const;

export function DocumentGenerator({ inspector, onBack }: DocumentGeneratorProps) {
    const [docType, setDocType] = useState<typeof DOCUMENT_TYPES[number]["id"]>("attestation_presence");
    const [dateReference, setDateReference] = useState(new Date().toISOString().split("T")[0]); // Default to today

    const generateMutation = api.inspecteur.generatePdf.useMutation({
        onSuccess: (data) => {
            if (data.success && data.pdfBase64) {
                // Convert base64 to blob
                const byteCharacters = atob(data.pdfBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "application/pdf" });

                // Create download link
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = data.filename || "document.pdf";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert("Failed to generate PDF: " + (data as any).message);
            }
        },
        onError: (error) => {
            console.error(error);
            alert("Failed to generate PDF: " + error.message);
        }
    });

    const handleGenerate = () => {
        generateMutation.mutate({
            inspectorId: inspector.id,
            documentType: docType,
            extraData: {
                dateReference
            }
        });
    };

    return (
        <div className="space-y-6 rounded-lg border border-gray-700 bg-gray-900/50 p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Generate Document</h2>
                <button onClick={onBack} className="text-sm text-gray-400 hover:text-white">
                    Change Inspector
                </button>
            </div>

            <div className="bg-gray-800 p-4 rounded-md">
                <div className="text-sm text-gray-400">Selected Inspector</div>
                <div className="text-lg font-bold text-white">{inspector.nomsPrenoms}</div>
                <div className="text-sm text-gray-300">
                    {inspector.grade} - {inspector.matricule}
                </div>
                <div className="text-sm text-gray-300">
                    {inspector.structurePrincipale}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Document Type
                    </label>
                    <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value as any)}
                        className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    >
                        {DOCUMENT_TYPES.map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Date Reference (Date de signature/effet)
                    </label>
                    <input
                        type="date"
                        value={dateReference}
                        onChange={(e) => setDateReference(e.target.value)}
                        className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {generateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <FileDown className="h-4 w-4" />
                    )}
                    {generateMutation.isPending ? "Generating..." : "Generate PDF"}
                </button>
            </div>
        </div>
    );
}
