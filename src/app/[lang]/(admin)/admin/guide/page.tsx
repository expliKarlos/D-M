export default async function AdminGuidePage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
                <h1 className="text-4xl font-fredoka font-bold text-slate-900 mb-3">
                    Admin Guide
                </h1>
                <p className="text-lg text-slate-600">
                    This documentation covers the administrative functions, system architecture, and operational procedures for managing the wedding application.
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl shadow-sm p-6 border border-orange-100">
                <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📑</span>
                    Table of Contents
                </h2>
                <nav className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <a href="#system-architecture" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">
                        → System Architecture
                    </a>
                    <a href="#visual-style-guide" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">
                        → Visual Style Guide
                    </a>
                    <a href="#guest-management" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">
                        → Guest Management
                    </a>
                    <a href="#gallery-categories" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">
                        → Gallery Categories
                    </a>
                    <a href="#concierge" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">
                        → D&M Concierge
                    </a>
                    <a href="#faq" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">
                        → FAQ
                    </a>
                </nav>
            </div>

            {/* System Architecture */}
            <section id="system-architecture" className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
                <h2 className="text-3xl font-fredoka font-bold text-slate-900 mb-6">
                    🗺️ System Architecture
                </h2>

                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 mb-6">
                        The application is structured into four primary sections, each serving a specific purpose:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-5 border border-pink-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">💑 Enlace (Timeline)</h3>
                            <p className="text-sm text-slate-600 mb-2">
                                <strong>Route:</strong> <code className="bg-white px-2 py-0.5 rounded">/enlace</code>
                            </p>
                            <p className="text-sm text-slate-700">
                                Interactive timeline displaying all wedding events with Spain (red/gold) and India (orange/pink) aesthetics.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">🗓️ Planning</h3>
                            <p className="text-sm text-slate-600 mb-2">
                                <strong>Route:</strong> <code className="bg-white px-2 py-0.5 rounded">/planning/*</code>
                            </p>
                            <p className="text-sm text-slate-700">
                                Includes Agenda, Spain Guide, India Guide, and Practical Info with interactive checklists.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">🎉 Participate</h3>
                            <p className="text-sm text-slate-600 mb-2">
                                <strong>Route:</strong> <code className="bg-white px-2 py-0.5 rounded">/participate/*</code>
                            </p>
                            <p className="text-sm text-slate-700">
                                Collaborative gallery (15 categories), wall of wishes, and interactive games.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">⚙️ Admin</h3>
                            <p className="text-sm text-slate-600 mb-2">
                                <strong>Route:</strong> <code className="bg-white px-2 py-0.5 rounded">/admin/*</code>
                            </p>
                            <p className="text-sm text-slate-700">
                                Dashboard, guest management, photo moderation, timeline editing, and push notifications.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visual Style Guide */}
            <section id="visual-style-guide" className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
                <h2 className="text-3xl font-fredoka font-bold text-slate-900 mb-6">
                    🎨 Visual Style Guide
                </h2>

                <div className="space-y-6">
                    {/* Color Palette */}
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Color Palette</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-700 mb-2">Spain Context</p>
                                <div className="flex gap-2">
                                    <div className="w-16 h-16 rounded-lg bg-red-600 border border-slate-200"></div>
                                    <div className="w-16 h-16 rounded-lg bg-amber-400 border border-slate-200"></div>
                                </div>
                                <p className="text-xs text-slate-600 mt-2">Red (#DC2626) → Gold (#FBBF24)</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700 mb-2">India Context</p>
                                <div className="flex gap-2">
                                    <div className="w-16 h-16 rounded-lg bg-orange-500 border border-slate-200"></div>
                                    <div className="w-16 h-16 rounded-lg bg-pink-500 border border-slate-200"></div>
                                </div>
                                <p className="text-xs text-slate-600 mt-2">Orange (#FF9933) → Pink (#EC4899)</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700 mb-2">Neutral Base</p>
                                <div className="flex gap-2">
                                    <div className="w-16 h-16 rounded-lg bg-slate-600 border border-slate-200"></div>
                                    <div className="w-16 h-16 rounded-lg bg-white border border-slate-200"></div>
                                </div>
                                <p className="text-xs text-slate-600 mt-2">Slate (#64748B) → White</p>
                            </div>
                        </div>
                    </div>

                    {/* Typography */}
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Typography</h3>
                        <div className="space-y-3 bg-slate-50 rounded-lg p-4">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Spain/Valladolid</p>
                                <p className="text-2xl font-[Cinzel]">Cinzel (Serif)</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 mb-1">India</p>
                                <p className="text-2xl font-[Tiro_Devanagari_Hindi]">Tiro Devanagari Hindi</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Body Text</p>
                                <p className="text-2xl font-outfit">Outfit (Sans-serif)</p>
                            </div>
                        </div>
                    </div>

                    {/* Hindi Ritual Icons */}
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Hindu Ritual Icons (Watercolor Style)</h3>
                        <p className="text-slate-700 mb-4">
                            15 custom watercolor icons representing traditional Hindu wedding ceremonies. Located in <code className="bg-slate-100 px-2 py-0.5 rounded text-sm">/public/icons/ritual-*.png</code>
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                <span className="text-2xl">🟡</span>
                                <p className="font-semibold mt-1">Haldi</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                <span className="text-2xl">🌿</span>
                                <p className="font-semibold mt-1">Mehndi</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                <span className="text-2xl">🎵</span>
                                <p className="font-semibold mt-1">Sangeet</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                <span className="text-2xl">🐴</span>
                                <p className="font-semibold mt-1">Baraat</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                <span className="text-2xl">🔥</span>
                                <p className="font-semibold mt-1">Agni Puja</p>
                            </div>
                        </div>
                    </div>

                    {/* Trilingual System */}
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Trilingual Support</h3>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-slate-700 mb-3">The application automatically detects and supports three languages:</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🇪🇸</span>
                                    <div>
                                        <p className="font-semibold text-slate-900">Spanish</p>
                                        <code className="text-xs text-slate-600">/es/*</code>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🇬🇧</span>
                                    <div>
                                        <p className="font-semibold text-slate-900">English</p>
                                        <code className="text-xs text-slate-600">/en/*</code>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🇮🇳</span>
                                    <div>
                                        <p className="font-semibold text-slate-900">Hindi</p>
                                        <code className="text-xs text-slate-600">/hi/*</code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Guest Management */}
            <section id="guest-management" className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
                <h2 className="text-3xl font-fredoka font-bold text-slate-900 mb-6">
                    👥 Guest Management
                </h2>

                <div className="space-y-4">
                    <p className="text-slate-700">
                        Access: <code className="bg-slate-100 px-2 py-0.5 rounded">/admin/guests</code>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-200 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-3">Adding a Guest</h3>
                            <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
                                <li>Click "Add Guest" button</li>
                                <li>Fill required fields:
                                    <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
                                        <li>Full name</li>
                                        <li>Email (used for login)</li>
                                        <li>Phone (optional, with country code)</li>
                                    </ul>
                                </li>
                                <li>Click "Create and Generate QR"</li>
                            </ol>
                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
                                <strong>Automated:</strong> System creates user account, generates unique QR code, and sends welcome email.
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-3">QR Code Management</h3>
                            <p className="text-sm text-slate-700 mb-3">
                                Each guest receives a unique QR code for app access.
                            </p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span className="text-slate-700">Download individual QR: Click download icon (⬇️)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span className="text-slate-700">Regenerate if lost: Re-download from guest row</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span className="text-slate-700">Export all: Use "Export to CSV" button</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Categories */}
            <section id="gallery-categories" className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
                <h2 className="text-3xl font-fredoka font-bold text-slate-900 mb-6">
                    📸 Gallery Category Management
                </h2>

                <div className="space-y-4">
                    <p className="text-slate-700">
                        Access: <code className="bg-slate-100 px-2 py-0.5 rounded">/admin/gallery</code>
                    </p>

                    <div className="border border-slate-200 rounded-lg p-5">
                        <h3 className="font-semibold text-slate-900 mb-4">Creating a New Category</h3>

                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-2 font-semibold text-slate-900">Field</th>
                                    <th className="text-left py-2 font-semibold text-slate-900">Description</th>
                                    <th className="text-left py-2 font-semibold text-slate-900">Example</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700">
                                <tr className="border-b border-slate-100">
                                    <td className="py-2">Unique ID</td>
                                    <td className="py-2">Lowercase, hyphens only</td>
                                    <td className="py-2"><code className="bg-slate-50 px-1">haldi</code></td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-2">Name (ES/EN/HI)</td>
                                    <td className="py-2">Trilingual titles</td>
                                    <td className="py-2">Haldi - Turmeric Ceremony</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-2">Description</td>
                                    <td className="py-2">Brief explanation (trilingual)</td>
                                    <td className="py-2">Application of turmeric paste...</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-2">Icon</td>
                                    <td className="py-2">Select from 15 ritual icons</td>
                                    <td className="py-2">🟡 (Haldi watercolor)</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                            <strong>Note:</strong> Deleting a category will not delete photos, but they will become uncategorized.
                        </div>
                    </div>
                </div>
            </section>

            {/* D&M Concierge */}
            <section id="concierge" className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
                <h2 className="text-3xl font-fredoka font-bold text-slate-900 mb-6">
                    🤖 D&M Concierge (AI Assistant)
                </h2>

                <div className="space-y-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                        <h3 className="font-semibold text-slate-900 mb-2">Technical Specifications</h3>
                        <ul className="text-sm text-slate-700 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600">•</span>
                                <span><strong>Model:</strong> Google Vertex AI (Gemini 2.5 Flash)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600">•</span>
                                <span><strong>Region:</strong> europe-west1</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600">•</span>
                                <span><strong>Context:</strong> Full application data (events, guides, traditions)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600">•</span>
                                <span><strong>Languages:</strong> Responds in user&apos;s selected language (ES/EN/HI)</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Use Cases</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="font-semibold text-sm text-slate-900 mb-1">✓ Ritual Information</p>
                                <p className="text-xs text-slate-600">Explains Hindu ceremonies (Haldi, Mehndi, Saptapadi)</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="font-semibold text-sm text-slate-900 mb-1">✓ Travel Recommendations</p>
                                <p className="text-xs text-slate-600">Hotels, restaurants, logistics in Valladolid/India</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="font-semibold text-sm text-slate-900 mb-1">✓ Event Schedules</p>
                                <p className="text-xs text-slate-600">Provides dates, times, locations with map links</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="font-semibold text-sm text-slate-900 mb-1">✓ Dress Code Guidance</p>
                                <p className="text-xs text-slate-600">Appropriate attire for each ceremony</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <h3 className="font-semibold text-slate-900 mb-2 text-sm">Privacy Policy</h3>
                        <p className="text-xs text-slate-600">
                            Conversations are <strong>not stored</strong> in the database. Only aggregated usage metrics (message count, usage times) are tracked for analytics.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
                <h2 className="text-3xl font-fredoka font-bold text-slate-900 mb-6">
                    ❓ Frequently Asked Questions
                </h2>

                <div className="space-y-4">
                    {/* FAQ 1 */}
                    <details className="border border-slate-200 rounded-lg overflow-hidden">
                        <summary className="bg-slate-50 px-5 py-4 cursor-pointer font-semibold text-slate-900 hover:bg-slate-100 transition-colors">
                            Guest lost their QR code. What should I do?
                        </summary>
                        <div className="p-5 text-sm text-slate-700 space-y-2">
                            <p><strong>Solution:</strong></p>
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>Navigate to Admin → Guests</li>
                                <li>Find the guest in the table</li>
                                <li>Click download icon (⬇️) to regenerate QR</li>
                                <li>Send via WhatsApp or email</li>
                            </ol>
                            <div className="bg-blue-50 rounded p-3 mt-3">
                                <strong>Alternative:</strong> Guest can log in with email + password (no QR required).
                            </div>
                        </div>
                    </details>

                    {/* FAQ 2 */}
                    <details className="border border-slate-200 rounded-lg overflow-hidden">
                        <summary className="bg-slate-50 px-5 py-4 cursor-pointer font-semibold text-slate-900 hover:bg-slate-100 transition-colors">
                            Guest doesn&apos;t know how to upload a photo to the gallery
                        </summary>
                        <div className="p-5 text-sm text-slate-700">
                            <p className="mb-2"><strong>Instructions to share:</strong></p>
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>Open app → Navigate to &quot;Participate&quot; → &quot;Gallery&quot;</li>
                                <li>Select the ceremony category (e.g., &quot;Haldi&quot;, &quot;Sangeet&quot;)</li>
                                <li>Click &quot;Upload Photo&quot; button (camera + icon)</li>
                                <li>Choose photo from gallery or take new one</li>
                                <li>Add optional caption</li>
                                <li>Click &quot;Publish&quot;</li>
                            </ol>
                            <div className="bg-green-50 rounded p-3 mt-3">
                                Photo appears <strong>immediately</strong> in public gallery. Admins can moderate from <code className="bg-white px-1">/admin/photos</code>.
                            </div>
                        </div>
                    </details>

                    {/* FAQ 3 */}
                    <details className="border border-slate-200 rounded-lg overflow-hidden">
                        <summary className="bg-slate-50 px-5 py-4 cursor-pointer font-semibold text-slate-900 hover:bg-slate-100 transition-colors">
                            Guests not receiving push notifications
                        </summary>
                        <div className="p-5 text-sm text-slate-700 space-y-3">
                            <p><strong>Common Reasons:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>PWA not installed → Must install as app icon on mobile</li>
                                <li>Notifications blocked → Enable in browser settings</li>
                                <li>Incompatible browser → Recommend Chrome (Android) or Safari (iOS)</li>
                            </ul>
                            <div className="bg-yellow-50 rounded p-3 mt-3">
                                <strong>Browser Settings:</strong><br />
                                • Android: Settings → Notifications → Allow<br />
                                • iOS: Settings → [Browser] → Notifications → Allow
                            </div>
                        </div>
                    </details>

                    {/* FAQ 4 */}
                    <details className="border border-slate-200 rounded-lg overflow-hidden">
                        <summary className="bg-slate-50 px-5 py-4 cursor-pointer font-semibold text-slate-900 hover:bg-slate-100 transition-colors">
                            How to update timeline event information
                        </summary>
                        <div className="p-5 text-sm text-slate-700">
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>Navigate to Admin → Timeline</li>
                                <li>Click Edit (✏️) on the event</li>
                                <li>Modify fields: date, time, trilingual descriptions</li>
                                <li>Click &quot;Save&quot;</li>
                            </ol>
                            <div className="bg-green-50 rounded p-3 mt-3">
                                Changes reflect <strong>instantly</strong> on <code className="bg-white px-1">/enlace</code> for all users.
                            </div>
                        </div>
                    </details>

                    {/* FAQ 5 */}
                    <details className="border border-slate-200 rounded-lg overflow-hidden">
                        <summary className="bg-slate-50 px-5 py-4 cursor-pointer font-semibold text-slate-900 hover:bg-slate-100 transition-colors">
                            How to remove inappropriate photo from gallery
                        </summary>
                        <div className="p-5 text-sm text-slate-700">
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>Navigate to Admin → Photos</li>
                                <li>Use filters to find photo (by category if needed)</li>
                                <li>Click Delete (🗑️)</li>
                                <li>Confirm deletion</li>
                            </ol>
                            <div className="bg-red-50 rounded p-3 mt-3">
                                <strong>Warning:</strong> Photo is permanently deleted from Supabase Storage. This action cannot be undone.
                            </div>
                        </div>
                    </details>
                </div>
            </section>

            {/* Support Section */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-fredoka font-bold mb-4">
                    📞 Technical Support
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-slate-300 mb-1">Platform Version</p>
                        <p className="font-semibold">Next.js 16 + Supabase + Firebase + Vertex AI</p>
                    </div>
                    <div>
                        <p className="text-slate-300 mb-1">Last Updated</p>
                        <p className="font-semibold">February 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
