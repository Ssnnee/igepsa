
"use client";

import { useState } from "react";
import { InspectorSearch } from "./_components/inspector-search";
import { DocumentGenerator } from "./_components/document-generator";

export default function AdminDocsPage() {
    const [selectedInspector, setSelectedInspector] = useState<any>(null);

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
            <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
                Administrative Documents
            </h1>

            {!selectedInspector ? (
                <div className="flex flex-col items-center gap-6">
                    <p className="text-gray-400 text-center max-w-lg">
                        Search for an inspector to generate administrative documents such as "Attestation de présence", "Reprise de service", etc.
                    </p>
                    <InspectorSearch onSelect={setSelectedInspector} />

                    <div className="mt-10 p-6 border border-gray-800 rounded-lg bg-gray-900/30 text-center">
                        <h3 className="text-gray-300 font-semibold mb-2">Instructions</h3>
                        <p className="text-gray-500 text-sm">
                            1. Search by name or matricule.<br />
                            2. Select the inspector.<br />
                            3. Choose the document type and fill in required dates.<br />
                            4. Click Generate to download the PDF.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="max-w-xl mx-auto">
                    <DocumentGenerator
                        inspector={selectedInspector}
                        onBack={() => setSelectedInspector(null)}
                    />
                </div>
            )}
        </div>
    );
}
