
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "common": {
        "save": "Save",
        "close": "Close",
        "back": "Back",
        "search": "Search",
        "loading": "Loading...",
        "status": "Status",
        "online": "Online",
        "offline": "Offline",
        "id": "ID"
      },
      "login": {
        "access_credentials": "Access Credentials",
        "email_placeholder": "email@bestro.com",
        "security_pin": "Security Pin",
        "forgot_pin": "Forgot?",
        "enter_terminal": "Enter Terminal",
        "register_new": "Register New Account",
        "failed_alert": "Failed: Invalid Email or PIN.",
        "identity_verification": "Identity Verification",
        "reset_pin": "Reset PIN",
        "staff_id": "Staff ID",
        "verify_identity": "Verify Identity",
        "save_new_pin": "Save New PIN",
        "pin_changed": "PIN successfully changed."
      },
      "dashboard": {
        "systems_active": "SYSTEMS ACTIVE",
        "my_queue": "My Queue",
        "team_pending": "Team Pending",
        "completed": "Completed",
        "defect_report": "Defect Report",
        "active_deficiency": "Active Deficiency Records",
        "task_registry": "Personal Task Registry",
        "dispatch_log": "Regional Dispatch Log",
        "registry_empty": "Registry Empty",
        "continue": "Continue",
        "review": "Review",
        "certify": "Certify",
        "dispatch_new": "Dispatch New Job",
        "building_name": "Building Name",
        "select_tech": "Select Field Tech",
        "confirm_dispatch": "Confirm Dispatch"
      },
      "settings": {
        "title": "Settings",
        "subtitle": "System Configuration",
        "security_hub": "Security Hub",
        "identity_details": "Identity Details",
        "app_config": "App Configuration",
        "notifications": "Push Notifications",
        "sync_cloud": "Sync Cloud Data",
        "system_control": "System Control",
        "logout": "Log Out",
        "factory_reset": "Factory Reset",
        "language": "Language / Bahasa",
        "manage_auth": "Manage Authorization",
        "edit_identity": "Edit Identity",
        "update_profile": "Update Profile",
        "sync_status": "Status: {{time}}"
      },
      "bottom_nav": {
        "dashboard": "Dashboard",
        "inspections": "Inspections",
        "users": "Users",
        "settings": "Settings"
      }
    }
  },
  ms: {
    translation: {
      "common": {
        "save": "Simpan",
        "close": "Tutup",
        "back": "Kembali",
        "search": "Cari",
        "loading": "Memuatkan...",
        "status": "Status",
        "online": "Aktif",
        "offline": "Luar Talian",
        "id": "ID"
      },
      "login": {
        "access_credentials": "Kredential Akses",
        "email_placeholder": "emel@bestro.com",
        "security_pin": "Pin Keselamatan",
        "forgot_pin": "Lupa?",
        "enter_terminal": "Masuk Terminal",
        "register_new": "Daftar Akaun Baru",
        "failed_alert": "Gagal: Emel atau PIN tidak sah.",
        "identity_verification": "Pengesahan Identiti",
        "reset_pin": "Tetap Semula PIN",
        "staff_id": "ID Staf",
        "verify_identity": "Sahkan Identiti",
        "save_new_pin": "Simpan PIN Baru",
        "pin_changed": "PIN berjaya ditukar."
      },
      "dashboard": {
        "systems_active": "SISTEM AKTIF",
        "my_queue": "Giliran Saya",
        "team_pending": "Pasukan Tertunda",
        "completed": "Selesai",
        "defect_report": "Laporan Kecacatan",
        "active_deficiency": "Rekod Kecacatan Aktif",
        "task_registry": "Daftar Tugas Peribadi",
        "dispatch_log": "Log Tugasan Wilayah",
        "registry_empty": "Daftar Kosong",
        "continue": "Teruskan",
        "review": "Semak",
        "certify": "Sahkan",
        "dispatch_new": "Tugasan Baru",
        "building_name": "Nama Bangunan",
        "select_tech": "Pilih Juruteknik",
        "confirm_dispatch": "Sahkan Tugasan"
      },
      "settings": {
        "title": "Tetapan",
        "subtitle": "Konfigurasi Sistem",
        "security_hub": "Hab Keselamatan",
        "identity_details": "Butiran Identiti",
        "app_config": "Konfigurasi Aplikasi",
        "notifications": "Notifikasi Tolak",
        "sync_cloud": "Penyelarasan Data Awan",
        "system_control": "Kawalan Sistem",
        "logout": "Log Keluar",
        "factory_reset": "Tetapan Kilang",
        "language": "Bahasa / Language",
        "manage_auth": "Urus Keizinan",
        "edit_identity": "Edit Identiti",
        "update_profile": "Kemaskini Profil",
        "sync_status": "Status: {{time}}"
      },
      "bottom_nav": {
        "dashboard": "Papan Pemuka",
        "inspections": "Pemeriksaan",
        "users": "Pengguna",
        "settings": "Tetapan"
      }
    }
  }
};

const savedLang = localStorage.getItem('app_language') || 'ms';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
