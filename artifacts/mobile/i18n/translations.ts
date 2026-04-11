export type LangCode = "en" | "ar" | "fr" | "es" | "de" | "nl" | "it" | "pt" | "tr" | "ru";

export type T = {
  tab_diagnose: string;
  tab_history: string;
  tab_garage: string;
  tab_more: string;

  home_tagline: string;
  home_start_diagnosis: string;
  home_cta_desc: string;
  home_diagnose_now: string;
  home_warning_signs: string;
  home_vehicle_systems: string;

  sys_engine: string;
  sys_brakes: string;
  sys_transmission: string;
  sys_electrical: string;
  sys_suspension: string;
  sys_cooling: string;
  sys_exhaust: string;
  sys_fuel: string;
  sys_ac: string;
  sys_steering: string;

  tip1_title: string;
  tip1_desc: string;
  tip2_title: string;
  tip2_desc: string;
  tip3_title: string;
  tip3_desc: string;
  tip4_title: string;
  tip4_desc: string;

  history_title: string;
  history_diagnoses: string;
  history_empty_title: string;
  history_empty_desc: string;
  history_start_first: string;

  sev_low: string;
  sev_medium: string;
  sev_high: string;
  sev_critical: string;
  unknown_vehicle: string;

  garage_title: string;
  garage_no_vehicles: string;
  garage_no_vehicles_desc: string;
  garage_add_vehicle: string;
  garage_add_first: string;
  garage_vehicle_health: string;
  garage_diagnoses: string;
  garage_last_severity: string;
  garage_color: string;
  garage_diagnose: string;
  garage_edit: string;
  health_good: string;
  health_fair: string;
  health_poor: string;

  delete_vehicle_title: string;
  delete_vehicle_msg: string;
  cancel: string;
  delete: string;
  error: string;
  delete_failed: string;

  more_title: string;
  menu_identify_part: string;
  menu_identify_part_desc: string;
  menu_statistics: string;
  menu_statistics_desc: string;
  menu_maintenance: string;
  menu_maintenance_desc: string;
  menu_fuel_log: string;
  menu_fuel_log_desc: string;
  menu_documents: string;
  menu_documents_desc: string;
  menu_nearby: string;
  menu_nearby_desc: string;
  menu_settings: string;
  menu_settings_desc: string;

  form_symptoms_label: string;
  form_symptoms_placeholder: string;
  form_photo_label: string;
  form_optional: string;
  form_take_photo: string;
  form_choose_photo: string;
  form_systems_label: string;
  form_conditions_label: string;
  form_prev_issues_label: string;
  form_prev_issues_placeholder: string;
  form_error_codes_label: string;
  form_error_codes_placeholder: string;
  form_currency_label: string;
  form_language_prefix: string;
  form_change: string;
  form_diagnose_btn: string;
  form_select_vehicle: string;
  form_add_vehicle_first: string;
  form_no_vehicle_go_add: string;
  form_condition_city: string;
  form_condition_highway: string;
  form_condition_offroad: string;
  form_condition_mixed: string;

  result_loading: string;
  result_not_found: string;
  result_go_back: string;
  result_safe_to_drive: string;
  result_confidence: string;
  result_diy_friendly: string;
  result_see_mechanic: string;
  result_summary: string;
  result_likely_causes: string;
  result_solution: string;
  result_cost: string;
  result_tips: string;
  result_systems: string;
  result_advanced: string;
  result_notes: string;
  result_new: string;
  result_contact_mechanic: string;
  result_pro_desc: string;
  result_watch_ad: string;
  result_questions_title: string;
  result_parts_title: string;
  result_prevention_title: string;

  sev_label_low: string;
  sev_label_medium: string;
  sev_label_high: string;
  sev_label_critical: string;
  sev_label_dangerous: string;

  screen_new_diagnosis: string;
  screen_result: string;
  screen_add_vehicle: string;
  screen_edit_vehicle: string;
  screen_fuel_log: string;
  screen_maintenance: string;
  screen_documents: string;
  screen_identify_part: string;
  screen_statistics: string;
  screen_nearby: string;
  screen_settings: string;

  settings_ai_settings: string;
  settings_ai_language: string;
  settings_ai_language_desc: string;
  settings_your_data: string;
  settings_vehicles: string;
  settings_diagnoses: string;
  settings_fuel_logs: string;
  settings_vehicles_count: string;
  settings_records_count: string;
  settings_entries_count: string;
  settings_app_info: string;
  settings_version: string;
  settings_privacy: string;
  settings_terms: string;
  settings_support: string;
  settings_contact: string;
  settings_rate: string;
  settings_modal_title: string;
  settings_modal_desc: string;
  settings_ads: string;
  settings_footer: string;

  filter_all: string;
  filter_all_vehicles: string;
  filter_7d: string;
  filter_30d: string;
  filter_3m: string;
  result_share: string;
  share_diagnosis_title: string;
};

const en: T = {
  tab_diagnose: "Diagnose",
  tab_history: "History",
  tab_garage: "My Garage",
  tab_more: "More",

  home_tagline: "AI Car Diagnosis",
  home_start_diagnosis: "Start New Diagnosis",
  home_cta_desc: "Describe your symptoms and get an AI-powered diagnosis in seconds",
  home_diagnose_now: "Diagnose Now",
  home_warning_signs: "Common Warning Signs",
  home_vehicle_systems: "Vehicle Systems",

  sys_engine: "Engine",
  sys_brakes: "Brakes",
  sys_transmission: "Transmission",
  sys_electrical: "Electrical",
  sys_suspension: "Suspension",
  sys_cooling: "Cooling",
  sys_exhaust: "Exhaust",
  sys_fuel: "Fuel System",
  sys_ac: "A/C",
  sys_steering: "Steering",

  tip1_title: "Check Engine Light",
  tip1_desc: "A lit check engine light often means a sensor or emissions issue — scan your OBD-II codes first.",
  tip2_title: "Squeaking Brakes",
  tip2_desc: "High-pitched squealing when braking usually means worn brake pads that need replacement.",
  tip3_title: "Overheating",
  tip3_desc: "Temperature gauge in the red zone — pull over safely. May indicate coolant leak or thermostat failure.",
  tip4_title: "Low Oil Pressure",
  tip4_desc: "Oil pressure warning? Stop driving immediately. Running without oil causes severe engine damage.",

  history_title: "History",
  history_diagnoses: "diagnoses",
  history_empty_title: "No diagnoses yet",
  history_empty_desc: "Your diagnosis history will appear here after your first scan",
  history_start_first: "Start First Diagnosis",

  sev_low: "Low",
  sev_medium: "Medium",
  sev_high: "High",
  sev_critical: "Critical",
  unknown_vehicle: "Unknown Vehicle",

  garage_title: "My Garage",
  garage_no_vehicles: "No vehicles yet",
  garage_no_vehicles_desc: "Add your first vehicle to start diagnosing and tracking maintenance",
  garage_add_vehicle: "Add Vehicle",
  garage_add_first: "Add Vehicle",
  garage_vehicle_health: "Vehicle Health",
  garage_diagnoses: "Diagnoses",
  garage_last_severity: "Last Severity",
  garage_color: "Color",
  garage_diagnose: "Diagnose",
  garage_edit: "Edit",
  health_good: "Good",
  health_fair: "Fair",
  health_poor: "Poor",

  delete_vehicle_title: "Delete Vehicle",
  delete_vehicle_msg: "Are you sure you want to delete %s? All associated data will be lost.",
  cancel: "Cancel",
  delete: "Delete",
  error: "Error",
  delete_failed: "Failed to delete vehicle",

  more_title: "More",
  menu_identify_part: "Identify Part",
  menu_identify_part_desc: "AI-powered part identification",
  menu_statistics: "Statistics",
  menu_statistics_desc: "Fuel & cost analytics",
  menu_maintenance: "Maintenance",
  menu_maintenance_desc: "Service records & schedule",
  menu_fuel_log: "Fuel Log",
  menu_fuel_log_desc: "Track fill-ups & economy",
  menu_documents: "Documents",
  menu_documents_desc: "Insurance & registration",
  menu_nearby: "Nearby Workshops",
  menu_nearby_desc: "Find mechanics near you",
  menu_settings: "Settings",
  menu_settings_desc: "App preferences",

  form_symptoms_label: "Describe Symptoms",
  form_symptoms_placeholder: "Describe what you hear, feel, or see… (noises, vibrations, lights, performance)",
  form_photo_label: "Photo",
  form_optional: "optional",
  form_take_photo: "Take Photo",
  form_choose_photo: "Choose Photo",
  form_systems_label: "Affected Systems",
  form_conditions_label: "Driving Conditions",
  form_prev_issues_label: "Previous Issues",
  form_prev_issues_placeholder: "Any past related issues or repairs…",
  form_error_codes_label: "OBD-II Error Codes",
  form_error_codes_placeholder: "e.g. P0301, P0420",
  form_currency_label: "Currency for Cost Estimate",
  form_language_prefix: "AI will respond in:",
  form_change: "Change",
  form_diagnose_btn: "Diagnose with AI",
  form_select_vehicle: "Select Vehicle",
  form_add_vehicle_first: "Add a Vehicle First",
  form_no_vehicle_go_add: "You need to add a vehicle before diagnosing.",
  form_condition_city: "City",
  form_condition_highway: "Highway",
  form_condition_offroad: "Off-road",
  form_condition_mixed: "Mixed",

  result_loading: "Loading diagnosis…",
  result_not_found: "Diagnosis not found",
  result_go_back: "Go Back",
  result_safe_to_drive: "Safe to Drive?",
  result_confidence: "confidence",
  result_diy_friendly: "DIY Friendly",
  result_see_mechanic: "See Mechanic",
  result_summary: "Summary",
  result_likely_causes: "Likely Causes",
  result_solution: "Recommended Solution",
  result_cost: "Estimated Cost",
  result_tips: "Maintenance Tips",
  result_systems: "Affected Systems",
  result_advanced: "Advanced Analysis",
  result_notes: "Notes",
  result_new: "New Diagnosis",
  result_contact_mechanic: "Contact mechanic for estimate",
  result_pro_desc: "Unlock personalized mechanic questions, required parts list, and prevention tips for this diagnosis.",
  result_watch_ad: "Watch Ad to Unlock",
  result_questions_title: "Questions to Ask Your Mechanic",
  result_parts_title: "Parts You May Need",
  result_prevention_title: "Prevention Tips",

  sev_label_low: "Low Severity",
  sev_label_medium: "Medium Severity",
  sev_label_high: "High Severity",
  sev_label_critical: "Critical",
  sev_label_dangerous: "Dangerous",

  screen_new_diagnosis: "New Diagnosis",
  screen_result: "Diagnosis Result",
  screen_add_vehicle: "Add Vehicle",
  screen_edit_vehicle: "Edit Vehicle",
  screen_fuel_log: "Fuel Log",
  screen_maintenance: "Maintenance",
  screen_documents: "Documents",
  screen_identify_part: "Identify Part",
  screen_statistics: "Statistics",
  screen_nearby: "Nearby Workshops",
  screen_settings: "Settings",

  settings_ai_settings: "AI SETTINGS",
  settings_ai_language: "AI Language",
  settings_ai_language_desc: "Language for diagnosis responses",
  settings_your_data: "YOUR DATA",
  settings_vehicles: "Vehicles",
  settings_diagnoses: "Diagnoses",
  settings_fuel_logs: "Fuel Logs",
  settings_vehicles_count: "%d vehicles",
  settings_records_count: "%d records",
  settings_entries_count: "%d entries",
  settings_app_info: "APP INFO",
  settings_version: "Version",
  settings_privacy: "Privacy Policy",
  settings_terms: "Terms of Service",
  settings_support: "SUPPORT",
  settings_contact: "Contact Support",
  settings_rate: "Rate GarageIQ",
  settings_modal_title: "AI Response Language",
  settings_modal_desc: "The AI mechanic will respond in your selected language.",
  settings_ads: "GarageIQ uses ads to remain free. Your data stays on your device and is never sold.",
  settings_footer: "Made with care for car enthusiasts everywhere",

  filter_all: "All",
  filter_all_vehicles: "All Vehicles",
  filter_7d: "7 Days",
  filter_30d: "30 Days",
  filter_3m: "3 Months",
  result_share: "Share",
  share_diagnosis_title: "GarageIQ Diagnosis Report",
};

const ar: T = {
  tab_diagnose: "تشخيص",
  tab_history: "السجل",
  tab_garage: "مرآبي",
  tab_more: "المزيد",

  home_tagline: "تشخيص سيارات بالذكاء الاصطناعي",
  home_start_diagnosis: "بدء تشخيص جديد",
  home_cta_desc: "صف الأعراض واحصل على تشخيص دقيق بالذكاء الاصطناعي في ثوانٍ",
  home_diagnose_now: "شخّص الآن",
  home_warning_signs: "تحذيرات شائعة",
  home_vehicle_systems: "أنظمة السيارة",

  sys_engine: "المحرك",
  sys_brakes: "الفرامل",
  sys_transmission: "ناقل الحركة",
  sys_electrical: "الكهرباء",
  sys_suspension: "التعليق",
  sys_cooling: "التبريد",
  sys_exhaust: "العادم",
  sys_fuel: "نظام الوقود",
  sys_ac: "تكييف",
  sys_steering: "التوجيه",

  tip1_title: "مصباح تحقق من المحرك",
  tip1_desc: "ضوء تحقق المحرك يشير غالباً إلى مشكلة في المستشعر أو الانبعاثات — افحص رموز OBD-II أولاً.",
  tip2_title: "صرير الفرامل",
  tip2_desc: "صريرٌ مرتفع عند الكبح يعني عادةً بلى وسادات الفرامل وتحتاج إلى استبدالها.",
  tip3_title: "ارتفاع درجة الحرارة",
  tip3_desc: "عقربة الحرارة في المنطقة الحمراء؟ أوقف السيارة بأمان. قد يشير إلى تسرب سائل تبريد أو عطل الثرموستات.",
  tip4_title: "انخفاض ضغط الزيت",
  tip4_desc: "تحذير ضغط الزيت؟ أوقف القيادة فوراً. السير بدون زيت يتلف المحرك بشدة.",

  history_title: "السجل",
  history_diagnoses: "تشخيص",
  history_empty_title: "لا توجد تشخيصات بعد",
  history_empty_desc: "سيظهر سجل التشخيص هنا بعد أول فحص",
  history_start_first: "ابدأ أول تشخيص",

  sev_low: "منخفض",
  sev_medium: "متوسط",
  sev_high: "مرتفع",
  sev_critical: "حرج",
  unknown_vehicle: "مركبة غير معروفة",

  garage_title: "مرآبي",
  garage_no_vehicles: "لا توجد مركبات بعد",
  garage_no_vehicles_desc: "أضف أول مركبة لبدء التشخيص وتتبع الصيانة",
  garage_add_vehicle: "إضافة مركبة",
  garage_add_first: "أضف مركبة",
  garage_vehicle_health: "صحة المركبة",
  garage_diagnoses: "تشخيصات",
  garage_last_severity: "آخر خطورة",
  garage_color: "اللون",
  garage_diagnose: "تشخيص",
  garage_edit: "تعديل",
  health_good: "جيد",
  health_fair: "مقبول",
  health_poor: "سيئ",

  delete_vehicle_title: "حذف المركبة",
  delete_vehicle_msg: "هل أنت متأكد من حذف %s؟ ستُفقد جميع البيانات المرتبطة.",
  cancel: "إلغاء",
  delete: "حذف",
  error: "خطأ",
  delete_failed: "فشل حذف المركبة",

  more_title: "المزيد",
  menu_identify_part: "تحديد القطعة",
  menu_identify_part_desc: "تحديد قطع السيارة بالذكاء الاصطناعي",
  menu_statistics: "الإحصائيات",
  menu_statistics_desc: "تحليلات الوقود والتكاليف",
  menu_maintenance: "الصيانة",
  menu_maintenance_desc: "سجلات الخدمة والجدول",
  menu_fuel_log: "سجل الوقود",
  menu_fuel_log_desc: "تتبع التعبئة والاقتصاد",
  menu_documents: "الوثائق",
  menu_documents_desc: "التأمين والتسجيل",
  menu_nearby: "ورش قريبة",
  menu_nearby_desc: "ابحث عن ميكانيكي قريب منك",
  menu_settings: "الإعدادات",
  menu_settings_desc: "تفضيلات التطبيق",

  form_symptoms_label: "صف الأعراض",
  form_symptoms_placeholder: "صف ما تسمعه أو تشعر به أو تراه… (أصوات، اهتزازات، أضواء، أداء)",
  form_photo_label: "صورة",
  form_optional: "اختياري",
  form_take_photo: "التقط صورة",
  form_choose_photo: "اختر صورة",
  form_systems_label: "الأنظمة المتأثرة",
  form_conditions_label: "ظروف القيادة",
  form_prev_issues_label: "مشاكل سابقة",
  form_prev_issues_placeholder: "أي مشاكل أو إصلاحات سابقة مرتبطة…",
  form_error_codes_label: "رموز خطأ OBD-II",
  form_error_codes_placeholder: "مثال: P0301, P0420",
  form_currency_label: "عملة تقدير التكلفة",
  form_language_prefix: "سيرد الذكاء الاصطناعي بـ:",
  form_change: "تغيير",
  form_diagnose_btn: "تشخيص بالذكاء الاصطناعي",
  form_select_vehicle: "اختر مركبة",
  form_add_vehicle_first: "أضف مركبة أولاً",
  form_no_vehicle_go_add: "يجب إضافة مركبة قبل التشخيص.",
  form_condition_city: "المدينة",
  form_condition_highway: "الطريق السريع",
  form_condition_offroad: "خارج الطريق",
  form_condition_mixed: "مختلطة",

  result_loading: "جاري تحميل التشخيص…",
  result_not_found: "التشخيص غير موجود",
  result_go_back: "رجوع",
  result_safe_to_drive: "هل يمكن القيادة؟",
  result_confidence: "ثقة",
  result_diy_friendly: "يمكن إصلاحه بنفسك",
  result_see_mechanic: "اذهب للميكانيكي",
  result_summary: "ملخص",
  result_likely_causes: "الأسباب المحتملة",
  result_solution: "الحل الموصى به",
  result_cost: "التكلفة التقديرية",
  result_tips: "نصائح الصيانة",
  result_systems: "الأنظمة المتأثرة",
  result_advanced: "تحليل متقدم",
  result_notes: "ملاحظات",
  result_new: "تشخيص جديد",
  result_contact_mechanic: "تواصل مع الميكانيكي للتقدير",
  result_pro_desc: "افتح الأسئلة المخصصة للميكانيكي وقائمة القطع المطلوبة ونصائح الوقاية لهذا التشخيص.",
  result_watch_ad: "شاهد إعلاناً للفتح",
  result_questions_title: "أسئلة لطرحها على الميكانيكي",
  result_parts_title: "القطع التي قد تحتاجها",
  result_prevention_title: "نصائح الوقاية",

  sev_label_low: "خطورة منخفضة",
  sev_label_medium: "خطورة متوسطة",
  sev_label_high: "خطورة عالية",
  sev_label_critical: "حالة حرجة",
  sev_label_dangerous: "خطير",

  screen_new_diagnosis: "تشخيص جديد",
  screen_result: "نتيجة التشخيص",
  screen_add_vehicle: "إضافة مركبة",
  screen_edit_vehicle: "تعديل المركبة",
  screen_fuel_log: "سجل الوقود",
  screen_maintenance: "الصيانة",
  screen_documents: "الوثائق",
  screen_identify_part: "تحديد القطعة",
  screen_statistics: "الإحصائيات",
  screen_nearby: "ورش قريبة",
  screen_settings: "الإعدادات",

  settings_ai_settings: "إعدادات الذكاء الاصطناعي",
  settings_ai_language: "لغة الذكاء الاصطناعي",
  settings_ai_language_desc: "لغة ردود التشخيص",
  settings_your_data: "بياناتك",
  settings_vehicles: "المركبات",
  settings_diagnoses: "التشخيصات",
  settings_fuel_logs: "سجلات الوقود",
  settings_vehicles_count: "%d مركبات",
  settings_records_count: "%d سجلات",
  settings_entries_count: "%d إدخالات",
  settings_app_info: "معلومات التطبيق",
  settings_version: "الإصدار",
  settings_privacy: "سياسة الخصوصية",
  settings_terms: "شروط الخدمة",
  settings_support: "الدعم",
  settings_contact: "تواصل مع الدعم",
  settings_rate: "قيّم التطبيق",
  settings_modal_title: "لغة رد الذكاء الاصطناعي",
  settings_modal_desc: "سيرد ميكانيكي الذكاء الاصطناعي بلغتك المختارة.",
  settings_ads: "يستخدم GarageIQ الإعلانات ليبقى مجانياً. بياناتك تبقى على جهازك ولا تُباع أبداً.",
  settings_footer: "صُنع باهتمام لعشاق السيارات في كل مكان",

  filter_all: "الكل",
  filter_all_vehicles: "كل المركبات",
  filter_7d: "٧ أيام",
  filter_30d: "٣٠ يوماً",
  filter_3m: "٣ أشهر",
  result_share: "مشاركة",
  share_diagnosis_title: "تقرير تشخيص GarageIQ",
};

const fr: T = {
  tab_diagnose: "Diagnostic",
  tab_history: "Historique",
  tab_garage: "Mon Garage",
  tab_more: "Plus",

  home_tagline: "Diagnostic Auto IA",
  home_start_diagnosis: "Nouveau Diagnostic",
  home_cta_desc: "Décrivez vos symptômes et obtenez un diagnostic IA en quelques secondes",
  home_diagnose_now: "Diagnostiquer",
  home_warning_signs: "Signes d'Alerte",
  home_vehicle_systems: "Systèmes du Véhicule",

  sys_engine: "Moteur",
  sys_brakes: "Freins",
  sys_transmission: "Transmission",
  sys_electrical: "Électrique",
  sys_suspension: "Suspension",
  sys_cooling: "Refroidissement",
  sys_exhaust: "Échappement",
  sys_fuel: "Carburant",
  sys_ac: "Climatisation",
  sys_steering: "Direction",

  tip1_title: "Voyant Moteur",
  tip1_desc: "Le voyant moteur indique souvent un problème de capteur ou d'émissions — lisez vos codes OBD-II en premier.",
  tip2_title: "Freins qui Grincent",
  tip2_desc: "Un sifflement aigu au freinage signifie généralement que les plaquettes sont usées.",
  tip3_title: "Surchauffe",
  tip3_desc: "Jauge dans le rouge — garez-vous en sécurité. Peut indiquer une fuite de liquide ou un thermostat défaillant.",
  tip4_title: "Pression d'Huile Basse",
  tip4_desc: "Alerte pression d'huile ? Arrêtez immédiatement. Rouler sans huile cause des dommages graves au moteur.",

  history_title: "Historique",
  history_diagnoses: "diagnostics",
  history_empty_title: "Aucun diagnostic",
  history_empty_desc: "Votre historique apparaîtra ici après votre premier scan",
  history_start_first: "Premier Diagnostic",

  sev_low: "Faible",
  sev_medium: "Moyen",
  sev_high: "Élevé",
  sev_critical: "Critique",
  unknown_vehicle: "Véhicule Inconnu",

  garage_title: "Mon Garage",
  garage_no_vehicles: "Aucun véhicule",
  garage_no_vehicles_desc: "Ajoutez votre premier véhicule pour commencer les diagnostics",
  garage_add_vehicle: "Ajouter un Véhicule",
  garage_add_first: "Ajouter un Véhicule",
  garage_vehicle_health: "Santé du Véhicule",
  garage_diagnoses: "Diagnostics",
  garage_last_severity: "Dernière Sévérité",
  garage_color: "Couleur",
  garage_diagnose: "Diagnostiquer",
  garage_edit: "Modifier",
  health_good: "Bon",
  health_fair: "Passable",
  health_poor: "Mauvais",

  delete_vehicle_title: "Supprimer le Véhicule",
  delete_vehicle_msg: "Êtes-vous sûr de vouloir supprimer %s ? Toutes les données seront perdues.",
  cancel: "Annuler",
  delete: "Supprimer",
  error: "Erreur",
  delete_failed: "Échec de la suppression",

  more_title: "Plus",
  menu_identify_part: "Identifier une Pièce",
  menu_identify_part_desc: "Identification par IA",
  menu_statistics: "Statistiques",
  menu_statistics_desc: "Analyses carburant et coûts",
  menu_maintenance: "Maintenance",
  menu_maintenance_desc: "Carnet d'entretien",
  menu_fuel_log: "Carnet Carburant",
  menu_fuel_log_desc: "Suivi des pleins",
  menu_documents: "Documents",
  menu_documents_desc: "Assurance & immatriculation",
  menu_nearby: "Garages Proches",
  menu_nearby_desc: "Trouvez un mécanicien près de vous",
  menu_settings: "Paramètres",
  menu_settings_desc: "Préférences de l'app",

  form_symptoms_label: "Décrivez les Symptômes",
  form_symptoms_placeholder: "Décrivez ce que vous entendez, ressentez ou voyez… (bruits, vibrations, voyants, performances)",
  form_photo_label: "Photo",
  form_optional: "optionnel",
  form_take_photo: "Prendre une Photo",
  form_choose_photo: "Choisir une Photo",
  form_systems_label: "Systèmes Affectés",
  form_conditions_label: "Conditions de Conduite",
  form_prev_issues_label: "Problèmes Antérieurs",
  form_prev_issues_placeholder: "Tout problème ou réparation antérieur lié…",
  form_error_codes_label: "Codes d'Erreur OBD-II",
  form_error_codes_placeholder: "ex. P0301, P0420",
  form_currency_label: "Devise pour l'Estimation",
  form_language_prefix: "L'IA répondra en :",
  form_change: "Modifier",
  form_diagnose_btn: "Diagnostiquer avec l'IA",
  form_select_vehicle: "Sélectionner un Véhicule",
  form_add_vehicle_first: "Ajoutez d'abord un Véhicule",
  form_no_vehicle_go_add: "Vous devez ajouter un véhicule avant de diagnostiquer.",
  form_condition_city: "Ville",
  form_condition_highway: "Autoroute",
  form_condition_offroad: "Tout-terrain",
  form_condition_mixed: "Mixte",

  result_loading: "Chargement du diagnostic…",
  result_not_found: "Diagnostic introuvable",
  result_go_back: "Retour",
  result_safe_to_drive: "Sûr à Conduire ?",
  result_confidence: "confiance",
  result_diy_friendly: "Faisable soi-même",
  result_see_mechanic: "Voir un Mécanicien",
  result_summary: "Résumé",
  result_likely_causes: "Causes Probables",
  result_solution: "Solution Recommandée",
  result_cost: "Coût Estimé",
  result_tips: "Conseils d'Entretien",
  result_systems: "Systèmes Affectés",
  result_advanced: "Analyse Avancée",
  result_notes: "Notes",
  result_new: "Nouveau Diagnostic",
  result_contact_mechanic: "Contactez un mécanicien pour l'estimation",
  result_pro_desc: "Débloquez les questions personnalisées, la liste de pièces et les conseils de prévention.",
  result_watch_ad: "Regarder une Pub pour Débloquer",
  result_questions_title: "Questions pour votre Mécanicien",
  result_parts_title: "Pièces dont vous pourriez avoir besoin",
  result_prevention_title: "Conseils de Prévention",

  sev_label_low: "Sévérité Faible",
  sev_label_medium: "Sévérité Moyenne",
  sev_label_high: "Sévérité Élevée",
  sev_label_critical: "Critique",
  sev_label_dangerous: "Dangereux",

  screen_new_diagnosis: "Nouveau Diagnostic",
  screen_result: "Résultat du Diagnostic",
  screen_add_vehicle: "Ajouter un Véhicule",
  screen_edit_vehicle: "Modifier le Véhicule",
  screen_fuel_log: "Carnet Carburant",
  screen_maintenance: "Maintenance",
  screen_documents: "Documents",
  screen_identify_part: "Identifier une Pièce",
  screen_statistics: "Statistiques",
  screen_nearby: "Garages Proches",
  screen_settings: "Paramètres",

  settings_ai_settings: "PARAMÈTRES IA",
  settings_ai_language: "Langue de l'IA",
  settings_ai_language_desc: "Langue des réponses de diagnostic",
  settings_your_data: "VOS DONNÉES",
  settings_vehicles: "Véhicules",
  settings_diagnoses: "Diagnostics",
  settings_fuel_logs: "Carnets Carburant",
  settings_vehicles_count: "%d véhicules",
  settings_records_count: "%d enregistrements",
  settings_entries_count: "%d entrées",
  settings_app_info: "INFO APP",
  settings_version: "Version",
  settings_privacy: "Politique de Confidentialité",
  settings_terms: "Conditions d'Utilisation",
  settings_support: "SUPPORT",
  settings_contact: "Contacter le Support",
  settings_rate: "Évaluer GarageIQ",
  settings_modal_title: "Langue des Réponses IA",
  settings_modal_desc: "Le mécanicien IA répondra dans votre langue sélectionnée.",
  settings_ads: "GarageIQ utilise des publicités pour rester gratuit. Vos données restent sur votre appareil.",
  settings_footer: "Fait avec soin pour les passionnés d'automobiles partout",

  filter_all: "Tout",
  filter_all_vehicles: "Tous les véhicules",
  filter_7d: "7 Jours",
  filter_30d: "30 Jours",
  filter_3m: "3 Mois",
  result_share: "Partager",
  share_diagnosis_title: "Rapport de diagnostic GarageIQ",
};

const es: T = { ...en,
  tab_diagnose: "Diagnóstico", tab_history: "Historial", tab_garage: "Mi Garage", tab_more: "Más",
  home_tagline: "Diagnóstico de Auto con IA", home_start_diagnosis: "Nuevo Diagnóstico", home_diagnose_now: "Diagnosticar",
  sys_engine: "Motor", sys_brakes: "Frenos", sys_transmission: "Transmisión", sys_electrical: "Eléctrico",
  sys_suspension: "Suspensión", sys_cooling: "Refrigeración", sys_exhaust: "Escape", sys_fuel: "Combustible",
  sys_ac: "Climatizador", sys_steering: "Dirección",
  history_title: "Historial", garage_title: "Mi Garage", more_title: "Más",
  settings_ai_language: "Idioma de la IA", screen_settings: "Configuración",
};

const de: T = { ...en,
  tab_diagnose: "Diagnose", tab_history: "Verlauf", tab_garage: "Meine Garage", tab_more: "Mehr",
  home_tagline: "KI-Fahrzeugdiagnose", home_start_diagnosis: "Neue Diagnose", home_diagnose_now: "Jetzt diagnostizieren",
  sys_engine: "Motor", sys_brakes: "Bremsen", sys_transmission: "Getriebe", sys_electrical: "Elektrik",
  sys_suspension: "Fahrwerk", sys_cooling: "Kühlung", sys_exhaust: "Auspuff", sys_fuel: "Kraftstoffsystem",
  sys_ac: "Klimaanlage", sys_steering: "Lenkung",
  history_title: "Verlauf", garage_title: "Meine Garage", more_title: "Mehr",
  settings_ai_language: "KI-Sprache", screen_settings: "Einstellungen",
};

const nl: T = { ...en,
  tab_diagnose: "Diagnose", tab_history: "Geschiedenis", tab_garage: "Mijn Garage", tab_more: "Meer",
  home_tagline: "AI Autodiagnose", home_diagnose_now: "Nu Diagnosticeren",
  sys_engine: "Motor", sys_brakes: "Remmen", sys_cooling: "Koeling", sys_steering: "Stuur",
  history_title: "Geschiedenis", garage_title: "Mijn Garage", more_title: "Meer",
};

const it: T = { ...en,
  tab_diagnose: "Diagnosi", tab_history: "Cronologia", tab_garage: "Il Mio Garage", tab_more: "Altro",
  home_tagline: "Diagnosi Auto con IA", home_diagnose_now: "Diagnostica Ora",
  sys_engine: "Motore", sys_brakes: "Freni", sys_transmission: "Trasmissione", sys_steering: "Sterzo",
  history_title: "Cronologia", garage_title: "Il Mio Garage", more_title: "Altro",
};

const pt: T = { ...en,
  tab_diagnose: "Diagnóstico", tab_history: "Histórico", tab_garage: "Minha Garagem", tab_more: "Mais",
  home_tagline: "Diagnóstico de Carro com IA", home_diagnose_now: "Diagnosticar Agora",
  sys_engine: "Motor", sys_brakes: "Freios", sys_transmission: "Câmbio", sys_steering: "Direção",
  history_title: "Histórico", garage_title: "Minha Garagem", more_title: "Mais",
};

const tr: T = { ...en,
  tab_diagnose: "Teşhis", tab_history: "Geçmiş", tab_garage: "Garaji'm", tab_more: "Daha",
  home_tagline: "Yapay Zeka Araç Teşhisi", home_diagnose_now: "Şimdi Teşhis Et",
  sys_engine: "Motor", sys_brakes: "Frenler", sys_transmission: "Vites", sys_steering: "Direksiyon",
  history_title: "Geçmiş", garage_title: "Garaji'm", more_title: "Daha",
};

const ru: T = { ...en,
  tab_diagnose: "Диагностика", tab_history: "История", tab_garage: "Мой Гараж", tab_more: "Ещё",
  home_tagline: "ИИ диагностика авто", home_diagnose_now: "Диагностировать",
  sys_engine: "Двигатель", sys_brakes: "Тормоза", sys_transmission: "Трансмиссия", sys_steering: "Рулевое",
  history_title: "История", garage_title: "Мой Гараж", more_title: "Ещё",
};

export const translations: Record<LangCode, T> = { en, ar, fr, es, de, nl, it, pt, tr, ru };
