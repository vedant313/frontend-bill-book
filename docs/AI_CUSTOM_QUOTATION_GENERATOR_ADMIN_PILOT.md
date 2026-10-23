# AI Custom Quotation Generator — Admin Pilot

## Scope
This feature is intentionally exposed only inside the existing Admin Control Panel. Do not add it to the customer sidebar or normal invoice creation flow until the pilot is reviewed and explicitly enabled.

## Required user flow
1. Admin uploads a PDF quotation/estimate (PDF only, 12 MB maximum).
2. Analyze every page, not only page one. Extract text and coordinates; detect likely editable values and tables.
3. Show a review screen with detected fields and confidence; admin can correct field labels/types.
4. Save a reusable template scoped to the authenticated admin user.
5. For a new estimate, admin fills detected values. Calculate totals only from explicit, validated line items/tax rules; do not silently guess tax/subsidy.
6. Generate a PDF retaining original pages as a visual background and replace/update only approved editable regions.
7. Offer preview and download, and compare output against the source before accepting the template.

## Current implementation status
The existing Custom Invoice Studio is a prototype: it extracts up to 35 selectable text items from page one in the browser, uses a sample HTML preview, and browser print for export. It does not yet produce a faithful same-format PDF, does not handle scanned PDFs with OCR, and does not perform semantic AI field detection. Do not describe it as complete or production-ready.

## Backend/security requirements
- Keep routes behind `requireAuth` and the existing admin guard for this pilot.
- Store each template under the authenticated user ID.
- Validate file type/size and avoid logging uploaded PDF contents or personal data.
- Any AI provider key must be server-side in environment variables, never shipped to Vite/browser code.
- Uploaded PDFs and extracted text must be treated as untrusted input.
- Keep existing invoices, GST, auth, subscriptions, and Cashfree payment routes unchanged.

## Completion checklist
- [ ] Full multi-page text and coordinate extraction
- [ ] OCR path for scanned/image-only PDFs
- [ ] AI-assisted field detection with confidence and manual review
- [ ] Editable fields form and explicit calculation rules
- [ ] Faithful PDF overlay/replacement and page-count preservation
- [ ] Per-admin template persistence
- [ ] Tests for selectable, scanned, multi-page, and complex-table PDFs
- [ ] Build and deployment verification before merging
