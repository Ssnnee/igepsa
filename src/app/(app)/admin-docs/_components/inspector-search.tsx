
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Loader2, Search } from "lucide-react";

interface InspectorSearchProps {
    onSelect: (inspector: any) => void;
}

export function InspectorSearch({ onSelect }: InspectorSearchProps) {
    const [query, setQuery] = useState("");

    // Debounce could be added here, but for now we'll just search on simple input or button click
    // Actually tRPC hook will refetch when query changes if enabled
    const { data: results, isLoading } = api.inspecteur.search.useQuery(
        { query },
        { enabled: query.length > 2 }
    );

    return (
        <div className="w-full max-w-md space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or matricule..."
                    className="w-full rounded-md border border-gray-700 bg-gray-900 px-10 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {isLoading && (
                    <div className="absolute right-3 top-3">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                )}
            </div>

            {results && results.length > 0 && (
                <ul className="divide-y divide-gray-800 rounded-md border border-gray-700 bg-gray-900">
                    {results.map((inspector) => (
                        <li
                            key={inspector.id}
                            className="cursor-pointer p-3 hover:bg-gray-800 transition-colors"
                            onClick={() => {
                                onSelect(inspector);
                                setQuery(""); // Clear search on select? or keep it?
                            }}
                        >
                            <div className="font-medium text-white">{inspector.nomsPrenoms}</div>
                            <div className="text-sm text-gray-400">
                                {inspector.matricule} - {inspector.grade}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {query.length > 2 && results?.length === 0 && !isLoading && (
                <p className="text-center text-gray-500">No inspectors found.</p>
            )}
        </div>
    );
}
