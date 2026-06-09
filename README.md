# NYSC Management Information System (NYSC-MIS)

**Live Application:** [https://nysc-mis-app.netlify.app](https://nysc-mis-app.netlify.app)

A web-based Computerized NYSC Management Information System for registering, managing, and reporting on corps member records at an NYSC state coordination office.

---

## Getting Started

### Default Admin Credentials

| Field    | Value                      |
|----------|----------------------------|
| Email    | `admin@nysc-mis.gov.ng`    |
| Password | `Admin@12345`              |

> **Important:** Change the admin password immediately after first login via your Supabase dashboard (Authentication → Users → select user → Reset password).

---

## User Roles

| Role      | Access Level |
|-----------|--------------|
| `admin`   | Full access — manages officers + all officer capabilities |
| `officer` | Registers and manages corps member records |
| `member`  | Read-only view of their own record |

---

## How to Use the System

### 1. Logging In

1. Go to [https://nysc-mis-app.netlify.app](https://nysc-mis-app.netlify.app)
2. Enter your email address and password
3. Click **Sign In**
   - Admins and officers are taken to the **Dashboard**
   - Corps members are taken to **My Record**

---

### 2. Dashboard

The dashboard shows:
- Summary counts — Total, Active, Suspended, and Revoked corps members
- Charts — Members by State of Origin and Blood Group distribution
- Recent Registrations — the 5 most recently added records
- Quick action buttons — Register New, View All Records, Generate Report

---

### 3. Registering a Corps Member

1. Click **Register Corps Member** in the sidebar or on the dashboard
2. Fill in all sections of the form:
   - **Personal Information** — name, date of birth, gender, blood group, marital status
   - **State & LGA** — state of origin, LGA, hometown
   - **Residential Information** — address, phone, occupation
   - **Next of Kin** — name, address, phone number
   - **Documents** — upload passport photo (max 2 MB) and signature (max 1 MB)
3. Click **Register Corps Member**
4. On success, a toast notification shows the generated **Personal Number**, **RC Number**, and **Form Number**
5. Choose **Generate ID Card** to print the card immediately, or **Register Another** to add another member

> Auto-generated codes follow the format: Personal Number `NG/KN/2026/001`, RC Number `RC-00001`, Form Number `FORM-00001`.

---

### 4. Viewing All Records

1. Click **All Records** in the sidebar
2. Use the **search box** to find members by name or personal number
3. Use the filter dropdowns to narrow by **Status**, **State of Origin**, or **Blood Group**
4. Click **View** on any row to see the full record detail

---

### 5. Editing a Record

1. Find the member in **All Records**
2. Click **Edit** on their row (or **Edit Record** on the detail page)
3. The form has 4 steps — navigate with **Next** / **Back**
4. Update any fields as needed; on step 4 you can replace the photo or signature
5. Click **Save Changes** to commit the update

> Auto-generated codes (Personal Number, RC Number, Form Number) cannot be changed.

---

### 6. Generating an ID Card

1. Find the member in **All Records** and click **ID Card**, or click **Generate ID Card** from the detail page
2. A print preview appears showing the front and back of the ID card
3. Click **Print ID Card** — your browser's print dialog opens
4. Select a printer or save as PDF
5. The card is sized to standard ID card dimensions (85.6 mm × 54 mm)

> For best print results: in the browser print dialog, set margins to **None** and enable **Background graphics**.

---

### 7. Deactivating a Record

1. Find the member in **All Records**
2. Click **Deactivate** on their row
3. Confirm in the modal that appears
4. The record status changes to **Suspended** — the record is never deleted

> Only admins can set status to **Revoked**. Officers can only suspend.

---

### 8. Reports

1. Click **Reports** in the sidebar
2. Use the filter controls to select State, LGA, Blood Group, Status, and/or Gender
3. Click **Generate Report** to fetch matching records
4. The table shows the filtered results with a total count above it

---

### 9. Managing Officers (Admin Only)

Accessible only to users with the `admin` role.

**Creating a new officer account:**
1. Click **Manage Officers** in the sidebar
2. Fill in the officer's full name, email, password, rank, state posted, and role
3. Click **Create Account**
4. The account is created immediately — no email confirmation required
5. Share the email and password with the officer so they can log in

**Viewing existing officers:**
The table below the form lists all officer accounts with their role, rank, and state. Admins can deactivate an officer from this table.

---

### 10. Corps Member Self-Service

Corps members log in with their own credentials and are taken directly to **My Record**, where they can view all their registration details and photo. No editing is available from this view.

> To link a corps member's login to their record: create their auth account via **Manage Officers** (set role to `member`), then update the applicant row's `linked_uid` in the Supabase Table Editor with the new user's UID.

---

## Support

For technical issues, contact the system developer.

---

## Technical Notes (for administrators)

- **Database:** Supabase (PostgreSQL) — project `bidjvjhsdhfooobucssn`
- **Storage:** Supabase Storage bucket `applicants` — holds all passport photos and signatures
- **Hosting:** Netlify — automatic deploys from the connected repository
- **Environment variables** required (set in Netlify Site Settings → Environment Variables):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_SUPABASE_SERVICE_ROLE_KEY`
