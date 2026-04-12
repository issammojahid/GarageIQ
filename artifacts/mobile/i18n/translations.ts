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
  filter_clear: string;
  filter_no_results: string;
  result_share: string;
  result_symptoms: string;
  share_diagnosis_title: string;
  vehicle_photo_add: string;
  vehicle_photo_change: string;
  vehicle_photo_remove: string;
  vehicle_photo_pick_title: string;
  vehicle_photo_camera: string;
  vehicle_photo_gallery: string;
  settings_appearance: string;
  settings_theme: string;
  settings_theme_dark: string;
  settings_theme_light: string;
  menu_parts_history: string;
  menu_parts_history_desc: string;
  menu_cost_calculator: string;
  menu_cost_calculator_desc: string;
  screen_parts_history: string;
  screen_cost_calculator: string;

  ph_no_parts: string;
  ph_no_parts_desc: string;
  ph_add_part: string;
  ph_edit_part: string;
  ph_part_name: string;
  ph_part_name_placeholder: string;
  ph_date: string;
  ph_cost: string;
  ph_mileage: string;
  ph_vehicle: string;
  ph_notes: string;
  ph_notes_placeholder: string;
  ph_required_name: string;
  ph_delete_title: string;
  ph_delete_msg: string;
  ph_remove: string;

  cc_no_items: string;
  cc_no_items_desc: string;
  cc_saved: string;
  cc_save: string;
  cc_tax_rate: string;
  cc_summary: string;
  cc_subtotal: string;
  cc_total: string;
  cc_select_currency: string;
  cc_add_item: string;
  cc_edit_item: string;
  cc_type: string;
  cc_type_part: string;
  cc_type_labor: string;
  cc_type_other: string;
  cc_description: string;
  cc_description_placeholder: string;
  cc_amount: string;
  cc_required_label: string;
  cc_remove_title: string;
  cc_remove_msg: string;
  cc_save_estimate: string;
  cc_estimate_title: string;
  cc_estimate_placeholder: string;
  cc_estimate_saved: string;
  cc_estimate_saved_msg: string;
  cc_saved_estimates: string;
  cc_delete_estimate: string;
  cc_delete_estimate_msg: string;
  cc_required_title: string;
  cc_update: string;
  cc_add: string;

  add_vehicle_subtitle: string;
  add_vehicle_field_vehicle: string;
  add_vehicle_select_placeholder: string;
  add_vehicle_field_mileage: string;
  add_vehicle_field_license: string;
  add_vehicle_field_color: string;
  add_vehicle_field_notes: string;
  add_vehicle_btn: string;
  save_changes_btn: string;
  vehicle_notes_any_info: string;
  vehicle_missing_info_title: string;
  vehicle_missing_info_msg: string;
  vehicle_invalid_year_title: string;
  vehicle_success_title: string;
  vehicle_added_success: string;
  vehicle_update_error: string;

  form_no_vehicle_title: string;
  form_no_input_title: string;
  form_no_input_msg: string;
  form_no_system_title: string;
  form_no_system_msg: string;

  vs_select_make: string;
  vs_select_year: string;
  vs_select_model: string;
  vs_search_brand_ph: string;
  vs_brand_subtitle: string;
  vs_enter_brand_manual: string;
  vs_brand_manual_ph: string;
  vs_next: string;
  vs_no_brands: string;
  vs_search_model_ph: string;
  vs_enter_model_manual: string;
  vs_model_manual_ph: string;
  vs_done: string;
  vs_no_models: string;
  vs_models_count: string;

  ad_label: string;

  vehicle_invalid_year_msg: string;

  diag_camera_web_title: string;
  diag_camera_web_msg: string;
  diag_camera_perm_title: string;
  diag_camera_perm_msg: string;
  diag_media_perm_title: string;
  diag_media_perm_msg: string;
  diag_photo_provided: string;
  diag_err_timeout_title: string;
  diag_err_timeout_msg: string;
  diag_err_no_internet_title: string;
  diag_err_no_internet_msg: string;
  diag_err_invalid_input_title: string;
  diag_err_invalid_input_msg: string;
  diag_err_auth_title: string;
  diag_err_auth_msg: string;
  diag_err_ai_title: string;
  diag_err_ai_msg: string;
  diag_err_server_title: string;
  diag_err_server_msg: string;
  diag_err_request_failed_msg: string;
  diag_err_default_msg: string;

  result_vehicle_fallback: string;
  result_share_footer: string;

  pro_ask_prefix: string;
  pro_fallback_q1: string;
  pro_fallback_q2: string;
  pro_fallback_q3: string;
  pro_fallback_p1: string;
  pro_fallback_p2: string;
  pro_fallback_p3: string;
  pro_tip_critical_1: string;
  pro_tip_critical_2: string;
  pro_tip_critical_3: string;
  pro_tip_high_1: string;
  pro_tip_high_2: string;
  pro_tip_high_3: string;
  pro_tip_medium_1: string;
  pro_tip_medium_2: string;
  pro_tip_medium_3: string;
  pro_tip_low_1: string;
  pro_tip_low_2: string;
  pro_tip_low_3: string;

  ok_btn: string;
  ph_vehicle_mileage: string;
  ph_vehicle_license: string;
  ph_vehicle_color: string;

  mech_screen_title: string;
  mech_register_title: string;
  mech_register_desc: string;
  mech_field_name: string;
  mech_field_phone: string;
  mech_field_city: string;
  mech_field_address: string;
  mech_field_specialties: string;
  mech_field_hours: string;
  mech_field_description: string;
  mech_field_edit_code: string;
  mech_field_edit_code_hint: string;
  mech_ph_name: string;
  mech_ph_phone: string;
  mech_ph_city: string;
  mech_ph_address: string;
  mech_ph_hours: string;
  mech_ph_description: string;
  mech_ph_edit_code: string;
  mech_submit: string;
  mech_success_title: string;
  mech_success_msg: string;
  mech_err_required: string;
  mech_err_phone: string;
  mech_err_code: string;
  mech_err_failed: string;
  mech_spec_engine: string;
  mech_spec_brakes: string;
  mech_spec_transmission: string;
  mech_spec_electrical: string;
  mech_spec_suspension: string;
  mech_spec_cooling: string;
  mech_spec_ac: string;
  mech_spec_tires: string;
  mech_spec_bodywork: string;
  mech_spec_general: string;
  mech_location_use: string;
  mech_cta_title: string;
  mech_cta_desc: string;
  mech_cta_btn: string;
  mech_sort_distance: string;
  mech_sort_rating: string;
  mech_sort_name: string;
  mech_sort_by: string;
  mech_open: string;
  mech_closed: string;
  mech_call: string;
  mech_directions: string;
  mech_km_away: string;
  mech_empty_title: string;
  mech_empty_desc: string;
  mech_loading: string;
  mech_city_filter: string;
  mech_all_cities: string;
  mech_manage_title: string;
  mech_manage_desc: string;
  mech_delete_btn: string;
  mech_delete_confirm: string;
  mech_delete_success: string;
  mech_update_btn: string;
  mech_update_success: string;

  menu_mechanic_register: string;
  menu_mechanic_register_desc: string;
  screen_mechanic_register: string;

  mech_location_section: string;
  mech_field_latitude: string;
  mech_field_longitude: string;
  mech_ph_latitude: string;
  mech_ph_longitude: string;
  mech_listing_id: string;
  mech_listing_id_ph: string;
  mech_listing_id_hint: string;
  mech_load_btn: string;
  mech_done_btn: string;
  mech_cancel_btn: string;
  mech_register_tab: string;
  mech_manage_tab: string;
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
  filter_clear: "Clear",
  filter_no_results: "No results match the selected filters",
  result_share: "Share",
  result_symptoms: "Symptoms",
  share_diagnosis_title: "GarageIQ Diagnosis Report",
  vehicle_photo_add: "Add Photo",
  vehicle_photo_change: "Change Photo",
  vehicle_photo_remove: "Remove Photo",
  vehicle_photo_pick_title: "Vehicle Photo",
  vehicle_photo_camera: "Take Photo",
  vehicle_photo_gallery: "Choose from Gallery",
  settings_appearance: "Appearance",
  settings_theme: "App Theme",
  settings_theme_dark: "Dark Mode",
  settings_theme_light: "Light Mode",
  menu_parts_history: "Replaced Parts",
  menu_parts_history_desc: "Track part replacements",
  menu_cost_calculator: "Cost Calculator",
  menu_cost_calculator_desc: "Estimate repair costs",
  screen_parts_history: "Replaced Parts",
  screen_cost_calculator: "Cost Calculator",

  ph_no_parts: "No parts recorded yet",
  ph_no_parts_desc: "Track every part you've replaced on your vehicles.",
  ph_add_part: "Add Replaced Part",
  ph_edit_part: "Edit Part Record",
  ph_part_name: "Part Name *",
  ph_part_name_placeholder: "e.g. Brake pads",
  ph_date: "Date",
  ph_cost: "Cost",
  ph_mileage: "Mileage (km)",
  ph_vehicle: "Vehicle",
  ph_notes: "Notes",
  ph_notes_placeholder: "Optional notes...",
  ph_required_name: "Part name is required.",
  ph_delete_title: "Delete Part",
  ph_delete_msg: "Remove this part record?",
  ph_remove: "Remove",

  cc_no_items: "No items yet",
  cc_no_items_desc: "Add parts, labor, and other costs to calculate your repair estimate.",
  cc_saved: "Saved",
  cc_save: "Save",
  cc_tax_rate: "Tax Rate (%)",
  cc_summary: "Estimate Summary",
  cc_subtotal: "Subtotal",
  cc_total: "Total",
  cc_select_currency: "Select Currency",
  cc_add_item: "Add Line Item",
  cc_edit_item: "Edit Item",
  cc_type: "Type",
  cc_type_part: "Part",
  cc_type_labor: "Labor",
  cc_type_other: "Other",
  cc_description: "Description *",
  cc_description_placeholder: "e.g. Brake pads",
  cc_amount: "Amount",
  cc_required_label: "Label is required.",
  cc_remove_title: "Remove",
  cc_remove_msg: "Remove this line item?",
  cc_save_estimate: "Save Estimate",
  cc_estimate_title: "Estimate Title",
  cc_estimate_placeholder: "e.g. Front brake service",
  cc_estimate_saved: "Saved",
  cc_estimate_saved_msg: "Estimate saved successfully.",
  cc_saved_estimates: "Saved Estimates",
  cc_delete_estimate: "Delete",
  cc_delete_estimate_msg: "Delete this saved estimate?",
  cc_required_title: "Required",
  cc_update: "Update",
  cc_add: "Add",

  add_vehicle_subtitle: "Enter your vehicle details below",
  add_vehicle_field_vehicle: "Vehicle *",
  add_vehicle_select_placeholder: "Select make, year & model...",
  add_vehicle_field_mileage: "Mileage (km)",
  add_vehicle_field_license: "License Plate",
  add_vehicle_field_color: "Color",
  add_vehicle_field_notes: "Notes",
  add_vehicle_btn: "Add Vehicle",
  save_changes_btn: "Save Changes",
  vehicle_notes_any_info: "Any additional info...",
  vehicle_missing_info_title: "Missing Info",
  vehicle_missing_info_msg: "Please select your vehicle make and model first.",
  vehicle_invalid_year_title: "Invalid Year",
  vehicle_success_title: "Success",
  vehicle_added_success: "Vehicle added successfully",
  vehicle_update_error: "Failed to update vehicle",

  form_no_vehicle_title: "Select Vehicle",
  form_no_input_title: "Add Input",
  form_no_input_msg: "Please add a photo or describe the symptoms",
  form_no_system_title: "Select System",
  form_no_system_msg: "Please select at least one affected system",

  vs_select_make: "Select Make",
  vs_select_year: "Select Year",
  vs_select_model: "Select Model",
  vs_search_brand_ph: "Search brand...",
  vs_brand_subtitle: "Search or enter your car brand",
  vs_enter_brand_manual: "Enter brand manually",
  vs_brand_manual_ph: "e.g. Haval, MG, Geely...",
  vs_next: "Next",
  vs_no_brands: "No brands found. Use \"Enter brand manually\" above.",
  vs_search_model_ph: "Search model...",
  vs_enter_model_manual: "Enter model manually",
  vs_model_manual_ph: "Model name...",
  vs_done: "Done",
  vs_no_models: "No models found. Use \"Enter model manually\" above.",
  vs_models_count: "models",

  ad_label: "Advertisement",

  vehicle_invalid_year_msg: "Year must be between 1980 and %d",

  diag_camera_web_title: "Not Supported",
  diag_camera_web_msg: "Camera capture is not available on web. Use Choose Photo instead.",
  diag_camera_perm_title: "Camera Permission Required",
  diag_camera_perm_msg: "Please allow camera access in your settings to take a photo.",
  diag_media_perm_title: "Photo Library Permission Required",
  diag_media_perm_msg: "Please allow photo library access in your settings to choose a photo.",
  diag_photo_provided: "Photo provided",
  diag_err_timeout_title: "Timeout",
  diag_err_timeout_msg: "Request took too long (20s). Check your connection and try again.",
  diag_err_no_internet_title: "No Internet",
  diag_err_no_internet_msg: "No internet connection. Check your network and try again.",
  diag_err_invalid_input_title: "Invalid Input",
  diag_err_invalid_input_msg: "Please check your input and try again.",
  diag_err_auth_title: "Auth Error",
  diag_err_auth_msg: "Invalid API key or unauthorized. Please contact support.",
  diag_err_ai_title: "AI Unavailable",
  diag_err_ai_msg: "AI service is temporarily unavailable. Please try again later.",
  diag_err_server_title: "Server Error",
  diag_err_server_msg: "Server error (%d). Please try again later.",
  diag_err_request_failed_msg: "Request failed with status %d. Please try again.",
  diag_err_default_msg: "Unable to analyze now. Please try again later.",

  result_vehicle_fallback: "Vehicle",
  result_share_footer: "— GarageIQ",

  pro_ask_prefix: "Ask about: \"%s\"",
  pro_fallback_q1: "Ask for a full diagnostic report.",
  pro_fallback_q2: "Inquire about warranty on parts.",
  pro_fallback_q3: "Request itemized repair estimate.",
  pro_fallback_p1: "Diagnostic report",
  pro_fallback_p2: "Relevant replacement parts",
  pro_fallback_p3: "Labor estimate",
  pro_tip_critical_1: "Get this fixed immediately — driving risks further damage.",
  pro_tip_critical_2: "Do not ignore warning lights.",
  pro_tip_critical_3: "Get a second mechanic opinion for cost verification.",
  pro_tip_high_1: "Schedule a repair within the week.",
  pro_tip_high_2: "Avoid long trips until resolved.",
  pro_tip_high_3: "Document symptoms for the mechanic.",
  pro_tip_medium_1: "Monitor for worsening symptoms.",
  pro_tip_medium_2: "Plan a repair within the month.",
  pro_tip_medium_3: "Check related fluid levels weekly.",
  pro_tip_low_1: "Address at next service visit.",
  pro_tip_low_2: "Keep an eye on symptom frequency.",
  pro_tip_low_3: "Log any changes in vehicle behavior.",

  ok_btn: "OK",
  ph_vehicle_mileage: "45000",
  ph_vehicle_license: "ABC 1234",
  ph_vehicle_color: "e.g. Black, White, Silver...",

  mech_screen_title: "Nearby Workshops",
  mech_register_title: "Register Your Garage",
  mech_register_desc: "Add your garage to GarageIQ and connect with drivers in your area.",
  mech_field_name: "Garage Name",
  mech_field_phone: "Phone Number",
  mech_field_city: "City",
  mech_field_address: "Address",
  mech_field_specialties: "Specialties",
  mech_field_hours: "Working Hours",
  mech_field_description: "Description",
  mech_field_edit_code: "Edit Code (PIN)",
  mech_field_edit_code_hint: "You'll need this PIN to edit or delete your listing later. Keep it safe!",
  mech_ph_name: "e.g. Hassan Auto Service",
  mech_ph_phone: "+212 6XX XXX XXX",
  mech_ph_city: "e.g. Casablanca",
  mech_ph_address: "e.g. 12 Rue Mohammed V",
  mech_ph_hours: "e.g. Mon–Sat 8am–7pm",
  mech_ph_description: "Describe your services and experience...",
  mech_ph_edit_code: "4+ digit PIN",
  mech_submit: "Register Garage",
  mech_success_title: "Garage Registered!",
  mech_success_msg: "Your garage is now live in the directory. Save your PIN to manage your listing.",
  mech_err_required: "Name, phone, and city are required.",
  mech_err_phone: "Please enter a valid phone number.",
  mech_err_code: "Edit code must be at least 4 characters.",
  mech_err_failed: "Registration failed. Please try again.",
  mech_spec_engine: "Engine",
  mech_spec_brakes: "Brakes",
  mech_spec_transmission: "Transmission",
  mech_spec_electrical: "Electrical",
  mech_spec_suspension: "Suspension",
  mech_spec_cooling: "Cooling",
  mech_spec_ac: "AC",
  mech_spec_tires: "Tires",
  mech_spec_bodywork: "Bodywork",
  mech_spec_general: "General",
  mech_location_use: "Use my location",
  mech_cta_title: "Are you a mechanic?",
  mech_cta_desc: "Add your garage to the directory and reach more drivers.",
  mech_cta_btn: "Register Free",
  mech_sort_distance: "Distance",
  mech_sort_rating: "Rating",
  mech_sort_name: "Name",
  mech_sort_by: "Sort by:",
  mech_open: "Open",
  mech_closed: "Closed",
  mech_call: "Call",
  mech_directions: "Directions",
  mech_km_away: "km away",
  mech_empty_title: "No workshops found",
  mech_empty_desc: "Be the first to add your garage in this area!",
  mech_loading: "Finding workshops near you...",
  mech_city_filter: "Search by city...",
  mech_all_cities: "All cities",
  mech_manage_title: "Manage Listing",
  mech_manage_desc: "Enter your PIN to edit or delete your listing.",
  mech_delete_btn: "Delete Listing",
  mech_delete_confirm: "This will permanently remove your listing.",
  mech_delete_success: "Your listing has been removed.",
  mech_update_btn: "Save Changes",
  mech_update_success: "Your listing has been updated.",

  menu_mechanic_register: "Register as Mechanic",
  menu_mechanic_register_desc: "Add your garage to the directory",
  screen_mechanic_register: "Register Garage",

  mech_location_section: "Location (GPS)",
  mech_field_latitude: "Latitude",
  mech_field_longitude: "Longitude",
  mech_ph_latitude: "e.g. 33.5731",
  mech_ph_longitude: "e.g. -7.5898",
  mech_listing_id: "Listing ID",
  mech_listing_id_ph: "Enter your listing ID",
  mech_listing_id_hint: "Your listing ID was shown after registration. Use it with your PIN to manage your listing.",
  mech_load_btn: "Load",
  mech_done_btn: "Done",
  mech_cancel_btn: "Cancel",
  mech_register_tab: "Register",
  mech_manage_tab: "Manage Listing",
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
  filter_clear: "مسح",
  filter_no_results: "لا توجد نتائج تطابق الفلاتر المحددة",
  result_share: "مشاركة",
  result_symptoms: "الأعراض",
  share_diagnosis_title: "تقرير تشخيص GarageIQ",
  vehicle_photo_add: "إضافة صورة",
  vehicle_photo_change: "تغيير الصورة",
  vehicle_photo_remove: "إزالة الصورة",
  vehicle_photo_pick_title: "صورة المركبة",
  vehicle_photo_camera: "التقاط صورة",
  vehicle_photo_gallery: "اختيار من المعرض",
  settings_appearance: "المظهر",
  settings_theme: "مظهر التطبيق",
  settings_theme_dark: "الوضع الداكن",
  settings_theme_light: "الوضع الفاتح",
  menu_parts_history: "قطع الغيار",
  menu_parts_history_desc: "تتبع قطع الغيار المستبدلة",
  menu_cost_calculator: "حاسبة التكلفة",
  menu_cost_calculator_desc: "تقدير تكاليف الإصلاح",
  screen_parts_history: "قطع الغيار",
  screen_cost_calculator: "حاسبة التكلفة",

  ph_no_parts: "لا توجد قطع مسجّلة بعد",
  ph_no_parts_desc: "تتبع كل قطعة استبدلتها في مركباتك.",
  ph_add_part: "إضافة قطعة مستبدلة",
  ph_edit_part: "تعديل سجل القطعة",
  ph_part_name: "اسم القطعة *",
  ph_part_name_placeholder: "مثال: فحمات الفرامل",
  ph_date: "التاريخ",
  ph_cost: "التكلفة",
  ph_mileage: "المسافة (كم)",
  ph_vehicle: "المركبة",
  ph_notes: "ملاحظات",
  ph_notes_placeholder: "ملاحظات اختيارية...",
  ph_required_name: "اسم القطعة مطلوب.",
  ph_delete_title: "حذف القطعة",
  ph_delete_msg: "هل تريد إزالة هذا السجل؟",
  ph_remove: "إزالة",

  cc_no_items: "لا توجد عناصر بعد",
  cc_no_items_desc: "أضف قطعاً وعمالة وتكاليف أخرى لحساب تقدير الإصلاح.",
  cc_saved: "محفوظ",
  cc_save: "حفظ",
  cc_tax_rate: "نسبة الضريبة (%)",
  cc_summary: "ملخص التقدير",
  cc_subtotal: "المجموع الفرعي",
  cc_total: "الإجمالي",
  cc_select_currency: "اختر العملة",
  cc_add_item: "إضافة بند",
  cc_edit_item: "تعديل البند",
  cc_type: "النوع",
  cc_type_part: "قطعة",
  cc_type_labor: "عمالة",
  cc_type_other: "أخرى",
  cc_description: "الوصف *",
  cc_description_placeholder: "مثال: فحمات الفرامل",
  cc_amount: "المبلغ",
  cc_required_label: "الوصف مطلوب.",
  cc_remove_title: "إزالة",
  cc_remove_msg: "هل تريد إزالة هذا البند؟",
  cc_save_estimate: "حفظ التقدير",
  cc_estimate_title: "عنوان التقدير",
  cc_estimate_placeholder: "مثال: صيانة الفرامل الأمامية",
  cc_estimate_saved: "تم الحفظ",
  cc_estimate_saved_msg: "تم حفظ التقدير بنجاح.",
  cc_saved_estimates: "التقديرات المحفوظة",
  cc_delete_estimate: "حذف",
  cc_delete_estimate_msg: "هل تريد حذف هذا التقدير؟",
  cc_required_title: "مطلوب",
  cc_update: "تحديث",
  cc_add: "إضافة",

  add_vehicle_subtitle: "أدخل تفاصيل مركبتك أدناه",
  add_vehicle_field_vehicle: "المركبة *",
  add_vehicle_select_placeholder: "اختر الماركة والسنة والموديل...",
  add_vehicle_field_mileage: "المسافة (كم)",
  add_vehicle_field_license: "لوحة الترقيم",
  add_vehicle_field_color: "اللون",
  add_vehicle_field_notes: "ملاحظات",
  add_vehicle_btn: "إضافة مركبة",
  save_changes_btn: "حفظ التغييرات",
  vehicle_notes_any_info: "أي معلومات إضافية...",
  vehicle_missing_info_title: "معلومات ناقصة",
  vehicle_missing_info_msg: "يرجى اختيار ماركة وموديل المركبة أولاً.",
  vehicle_invalid_year_title: "سنة غير صحيحة",
  vehicle_success_title: "تم بنجاح",
  vehicle_added_success: "تمت إضافة المركبة بنجاح",
  vehicle_update_error: "فشل في تحديث المركبة",

  form_no_vehicle_title: "اختر مركبة",
  form_no_input_title: "أضف مدخلاً",
  form_no_input_msg: "يرجى إضافة صورة أو وصف الأعراض",
  form_no_system_title: "اختر نظاماً",
  form_no_system_msg: "يرجى اختيار نظام واحد على الأقل",

  vs_select_make: "اختر الماركة",
  vs_select_year: "اختر السنة",
  vs_select_model: "اختر الموديل",
  vs_search_brand_ph: "ابحث عن الماركة...",
  vs_brand_subtitle: "ابحث أو أدخل ماركة سيارتك",
  vs_enter_brand_manual: "أدخل الماركة يدوياً",
  vs_brand_manual_ph: "مثال: هافال، MG، جيلي...",
  vs_next: "التالي",
  vs_no_brands: "لم يتم العثور على ماركات. استخدم \"أدخل الماركة يدوياً\".",
  vs_search_model_ph: "ابحث عن الموديل...",
  vs_enter_model_manual: "أدخل الموديل يدوياً",
  vs_model_manual_ph: "اسم الموديل...",
  vs_done: "تم",
  vs_no_models: "لم يتم العثور على موديلات. استخدم \"أدخل الموديل يدوياً\".",
  vs_models_count: "موديل",

  ad_label: "إعلان",

  vehicle_invalid_year_msg: "يجب أن تكون السنة بين 1980 و %d",

  diag_camera_web_title: "غير متاح",
  diag_camera_web_msg: "التقاط الصور من الكاميرا غير متاح على الويب. استخدم اختيار صورة بدلاً من ذلك.",
  diag_camera_perm_title: "إذن الكاميرا مطلوب",
  diag_camera_perm_msg: "يرجى السماح بالوصول إلى الكاميرا في الإعدادات.",
  diag_media_perm_title: "إذن مكتبة الصور مطلوب",
  diag_media_perm_msg: "يرجى السماح بالوصول إلى مكتبة الصور في الإعدادات.",
  diag_photo_provided: "تم تقديم صورة",
  diag_err_timeout_title: "انتهت المهلة",
  diag_err_timeout_msg: "استغرق الطلب وقتاً طويلاً (20 ثانية). تحقق من اتصالك وأعد المحاولة.",
  diag_err_no_internet_title: "لا إنترنت",
  diag_err_no_internet_msg: "لا يوجد اتصال بالإنترنت. تحقق من شبكتك وأعد المحاولة.",
  diag_err_invalid_input_title: "مدخل غير صالح",
  diag_err_invalid_input_msg: "يرجى التحقق من المدخلات والمحاولة مجدداً.",
  diag_err_auth_title: "خطأ في المصادقة",
  diag_err_auth_msg: "مفتاح API غير صالح أو غير مصرح. تواصل مع الدعم.",
  diag_err_ai_title: "الذكاء الاصطناعي غير متاح",
  diag_err_ai_msg: "خدمة الذكاء الاصطناعي غير متاحة مؤقتاً. أعد المحاولة لاحقاً.",
  diag_err_server_title: "خطأ في الخادم",
  diag_err_server_msg: "خطأ في الخادم (%d). أعد المحاولة لاحقاً.",
  diag_err_request_failed_msg: "فشل الطلب بحالة %d. أعد المحاولة.",
  diag_err_default_msg: "تعذر التحليل حالياً. أعد المحاولة لاحقاً.",

  result_vehicle_fallback: "مركبة",
  result_share_footer: "— GarageIQ",

  pro_ask_prefix: "اسأل عن: \"%s\"",
  pro_fallback_q1: "اطلب تقرير تشخيصي كامل.",
  pro_fallback_q2: "استفسر عن ضمان قطع الغيار.",
  pro_fallback_q3: "اطلب تقديراً مفصلاً للتكاليف.",
  pro_fallback_p1: "تقرير التشخيص",
  pro_fallback_p2: "قطع الغيار المناسبة",
  pro_fallback_p3: "تقدير تكلفة العمالة",
  pro_tip_critical_1: "قم بالإصلاح فوراً — القيادة قد تسبب أضراراً إضافية.",
  pro_tip_critical_2: "لا تتجاهل أضواء التحذير.",
  pro_tip_critical_3: "احصل على رأي ميكانيكي ثانٍ للتحقق من التكلفة.",
  pro_tip_high_1: "حدد موعداً للإصلاح في غضون أسبوع.",
  pro_tip_high_2: "تجنب الرحلات الطويلة حتى الحل.",
  pro_tip_high_3: "وثّق الأعراض للميكانيكي.",
  pro_tip_medium_1: "راقب تفاقم الأعراض.",
  pro_tip_medium_2: "خطط للإصلاح خلال الشهر.",
  pro_tip_medium_3: "تحقق من مستويات السوائل ذات الصلة أسبوعياً.",
  pro_tip_low_1: "تعامل مع الموضوع في الزيارة القادمة للصيانة.",
  pro_tip_low_2: "راقب تكرار الأعراض.",
  pro_tip_low_3: "سجّل أي تغييرات في سلوك المركبة.",

  ok_btn: "حسناً",
  ph_vehicle_mileage: "45000",
  ph_vehicle_license: "أ ب 1234",
  ph_vehicle_color: "مثال: أسود، أبيض، فضي...",

  mech_screen_title: "ورش قريبة",
  mech_register_title: "سجّل مرآبك",
  mech_register_desc: "أضف مرآبك إلى GarageIQ وتواصل مع السائقين في منطقتك.",
  mech_field_name: "اسم المرآب",
  mech_field_phone: "رقم الهاتف",
  mech_field_city: "المدينة",
  mech_field_address: "العنوان",
  mech_field_specialties: "التخصصات",
  mech_field_hours: "ساعات العمل",
  mech_field_description: "الوصف",
  mech_field_edit_code: "رمز التعديل (PIN)",
  mech_field_edit_code_hint: "ستحتاج إلى هذا الرمز لتعديل أو حذف إدراجك لاحقاً. احتفظ به بأمان!",
  mech_ph_name: "مثال: خدمة حسن للسيارات",
  mech_ph_phone: "+212 6XX XXX XXX",
  mech_ph_city: "مثال: الدار البيضاء",
  mech_ph_address: "مثال: 12 شارع محمد الخامس",
  mech_ph_hours: "مثال: الإثنين–السبت 8ص–7م",
  mech_ph_description: "صف خدماتك وخبرتك...",
  mech_ph_edit_code: "رمز 4 أرقام أو أكثر",
  mech_submit: "تسجيل المرآب",
  mech_success_title: "تم تسجيل المرآب!",
  mech_success_msg: "مرآبك الآن ظاهر في الدليل. احفظ رمزك لإدارة إدراجك.",
  mech_err_required: "الاسم والهاتف والمدينة مطلوبة.",
  mech_err_phone: "الرجاء إدخال رقم هاتف صحيح.",
  mech_err_code: "رمز التعديل يجب أن يكون 4 أحرف على الأقل.",
  mech_err_failed: "فشل التسجيل. يرجى المحاولة مرة أخرى.",
  mech_spec_engine: "المحرك",
  mech_spec_brakes: "المكابح",
  mech_spec_transmission: "ناقل الحركة",
  mech_spec_electrical: "الكهرباء",
  mech_spec_suspension: "التعليق",
  mech_spec_cooling: "التبريد",
  mech_spec_ac: "تكييف",
  mech_spec_tires: "الإطارات",
  mech_spec_bodywork: "هيكل السيارة",
  mech_spec_general: "عام",
  mech_location_use: "استخدم موقعي",
  mech_cta_title: "هل أنت ميكانيكي؟",
  mech_cta_desc: "أضف مرآبك إلى الدليل وتواصل مع المزيد من السائقين.",
  mech_cta_btn: "سجّل مجاناً",
  mech_sort_distance: "المسافة",
  mech_sort_rating: "التقييم",
  mech_sort_name: "الاسم",
  mech_sort_by: "ترتيب حسب:",
  mech_open: "مفتوح",
  mech_closed: "مغلق",
  mech_call: "اتصال",
  mech_directions: "اتجاهات",
  mech_km_away: "كم",
  mech_empty_title: "لا توجد ورش",
  mech_empty_desc: "كن أول من يضيف مرآبه في هذه المنطقة!",
  mech_loading: "جاري البحث عن ورش قريبة...",
  mech_city_filter: "ابحث بالمدينة...",
  mech_all_cities: "جميع المدن",
  mech_manage_title: "إدارة الإدراج",
  mech_manage_desc: "أدخل رمزك لتعديل أو حذف إدراجك.",
  mech_delete_btn: "حذف الإدراج",
  mech_delete_confirm: "سيؤدي هذا إلى إزالة إدراجك نهائياً.",
  mech_delete_success: "تم حذف إدراجك.",
  mech_update_btn: "حفظ التغييرات",
  mech_update_success: "تم تحديث إدراجك.",

  menu_mechanic_register: "سجّل كميكانيكي",
  menu_mechanic_register_desc: "أضف مرآبك إلى الدليل",
  screen_mechanic_register: "تسجيل المرآب",

  mech_location_section: "الموقع الجغرافي (GPS)",
  mech_field_latitude: "خط العرض",
  mech_field_longitude: "خط الطول",
  mech_ph_latitude: "مثال: 33.5731",
  mech_ph_longitude: "مثال: -7.5898",
  mech_listing_id: "معرّف الإدراج",
  mech_listing_id_ph: "أدخل معرّف إدراجك",
  mech_listing_id_hint: "تم عرض معرّف إدراجك بعد التسجيل. استخدمه مع رمزك لإدارة إدراجك.",
  mech_load_btn: "تحميل",
  mech_done_btn: "تم",
  mech_cancel_btn: "إلغاء",
  mech_register_tab: "تسجيل",
  mech_manage_tab: "إدارة الإدراج",
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
  filter_clear: "Effacer",
  filter_no_results: "Aucun résultat ne correspond aux filtres",
  result_share: "Partager",
  result_symptoms: "Symptômes",
  share_diagnosis_title: "Rapport de diagnostic GarageIQ",
  vehicle_photo_add: "Ajouter une photo",
  vehicle_photo_change: "Changer la photo",
  vehicle_photo_remove: "Supprimer la photo",
  vehicle_photo_pick_title: "Photo du véhicule",
  vehicle_photo_camera: "Prendre une photo",
  vehicle_photo_gallery: "Choisir dans la galerie",
  settings_appearance: "Apparence",
  settings_theme: "Thème",
  settings_theme_dark: "Mode sombre",
  settings_theme_light: "Mode clair",
  menu_parts_history: "Pièces remplacées",
  menu_parts_history_desc: "Historique des pièces",
  menu_cost_calculator: "Calculateur de coût",
  menu_cost_calculator_desc: "Estimer les réparations",
  screen_parts_history: "Pièces remplacées",
  screen_cost_calculator: "Calculateur de coût",

  ph_no_parts: "Aucune pièce enregistrée",
  ph_no_parts_desc: "Suivez chaque pièce remplacée sur vos véhicules.",
  ph_add_part: "Ajouter une pièce",
  ph_edit_part: "Modifier la pièce",
  ph_part_name: "Nom de la pièce *",
  ph_part_name_placeholder: "ex. Plaquettes de frein",
  ph_date: "Date",
  ph_cost: "Coût",
  ph_mileage: "Kilométrage (km)",
  ph_vehicle: "Véhicule",
  ph_notes: "Notes",
  ph_notes_placeholder: "Notes optionnelles...",
  ph_required_name: "Le nom de la pièce est requis.",
  ph_delete_title: "Supprimer la pièce",
  ph_delete_msg: "Supprimer cet enregistrement ?",
  ph_remove: "Retirer",

  cc_no_items: "Aucun élément",
  cc_no_items_desc: "Ajoutez des pièces, de la main-d'œuvre et d'autres coûts pour estimer votre réparation.",
  cc_saved: "Sauvegardé",
  cc_save: "Sauvegarder",
  cc_tax_rate: "Taux de taxe (%)",
  cc_summary: "Résumé du devis",
  cc_subtotal: "Sous-total",
  cc_total: "Total",
  cc_select_currency: "Sélectionner la devise",
  cc_add_item: "Ajouter un poste",
  cc_edit_item: "Modifier le poste",
  cc_type: "Type",
  cc_type_part: "Pièce",
  cc_type_labor: "Main-d'œuvre",
  cc_type_other: "Autre",
  cc_description: "Description *",
  cc_description_placeholder: "ex. Plaquettes de frein",
  cc_amount: "Montant",
  cc_required_label: "La description est requise.",
  cc_remove_title: "Retirer",
  cc_remove_msg: "Supprimer ce poste ?",
  cc_save_estimate: "Sauvegarder le devis",
  cc_estimate_title: "Titre du devis",
  cc_estimate_placeholder: "ex. Freins avant",
  cc_estimate_saved: "Sauvegardé",
  cc_estimate_saved_msg: "Devis sauvegardé avec succès.",
  cc_saved_estimates: "Devis sauvegardés",
  cc_delete_estimate: "Supprimer",
  cc_delete_estimate_msg: "Supprimer ce devis sauvegardé ?",
  cc_required_title: "Requis",
  cc_update: "Mettre à jour",
  cc_add: "Ajouter",

  add_vehicle_subtitle: "Entrez les détails de votre véhicule ci-dessous",
  add_vehicle_field_vehicle: "Véhicule *",
  add_vehicle_select_placeholder: "Sélectionnez la marque, l'année et le modèle...",
  add_vehicle_field_mileage: "Kilométrage (km)",
  add_vehicle_field_license: "Plaque d'immatriculation",
  add_vehicle_field_color: "Couleur",
  add_vehicle_field_notes: "Notes",
  add_vehicle_btn: "Ajouter un Véhicule",
  save_changes_btn: "Enregistrer",
  vehicle_notes_any_info: "Informations supplémentaires...",
  vehicle_missing_info_title: "Infos manquantes",
  vehicle_missing_info_msg: "Veuillez sélectionner la marque et le modèle de votre véhicule.",
  vehicle_invalid_year_title: "Année invalide",
  vehicle_success_title: "Succès",
  vehicle_added_success: "Véhicule ajouté avec succès",
  vehicle_update_error: "Échec de la mise à jour du véhicule",

  form_no_vehicle_title: "Sélectionner un Véhicule",
  form_no_input_title: "Ajouter des infos",
  form_no_input_msg: "Veuillez ajouter une photo ou décrire les symptômes",
  form_no_system_title: "Sélectionner un Système",
  form_no_system_msg: "Veuillez sélectionner au moins un système affecté",

  vs_select_make: "Sélectionner la Marque",
  vs_select_year: "Sélectionner l'Année",
  vs_select_model: "Sélectionner le Modèle",
  vs_search_brand_ph: "Rechercher une marque...",
  vs_brand_subtitle: "Recherchez ou entrez votre marque",
  vs_enter_brand_manual: "Saisir la marque manuellement",
  vs_brand_manual_ph: "ex. Haval, MG, Geely...",
  vs_next: "Suivant",
  vs_no_brands: "Aucune marque trouvée. Utilisez \"Saisir la marque manuellement\".",
  vs_search_model_ph: "Rechercher un modèle...",
  vs_enter_model_manual: "Saisir le modèle manuellement",
  vs_model_manual_ph: "Nom du modèle...",
  vs_done: "Terminer",
  vs_no_models: "Aucun modèle trouvé. Utilisez \"Saisir le modèle manuellement\".",
  vs_models_count: "modèles",

  ad_label: "Publicité",

  vehicle_invalid_year_msg: "L'année doit être comprise entre 1980 et %d",

  diag_camera_web_title: "Non supporté",
  diag_camera_web_msg: "La capture par caméra n'est pas disponible sur web. Utilisez Choisir une photo.",
  diag_camera_perm_title: "Accès caméra requis",
  diag_camera_perm_msg: "Veuillez autoriser l'accès à la caméra dans les paramètres.",
  diag_media_perm_title: "Accès médiathèque requis",
  diag_media_perm_msg: "Veuillez autoriser l'accès à la médiathèque dans les paramètres.",
  diag_photo_provided: "Photo fournie",
  diag_err_timeout_title: "Délai dépassé",
  diag_err_timeout_msg: "La requête a pris trop de temps (20s). Vérifiez votre connexion et réessayez.",
  diag_err_no_internet_title: "Pas de connexion",
  diag_err_no_internet_msg: "Pas de connexion Internet. Vérifiez votre réseau et réessayez.",
  diag_err_invalid_input_title: "Entrée invalide",
  diag_err_invalid_input_msg: "Veuillez vérifier vos données et réessayer.",
  diag_err_auth_title: "Erreur d'auth",
  diag_err_auth_msg: "Clé API invalide ou non autorisé. Contactez le support.",
  diag_err_ai_title: "IA indisponible",
  diag_err_ai_msg: "Le service IA est temporairement indisponible. Réessayez plus tard.",
  diag_err_server_title: "Erreur serveur",
  diag_err_server_msg: "Erreur serveur (%d). Veuillez réessayer plus tard.",
  diag_err_request_failed_msg: "Échec de la requête avec le statut %d. Réessayez.",
  diag_err_default_msg: "Analyse impossible pour l'instant. Réessayez plus tard.",

  result_vehicle_fallback: "Véhicule",
  result_share_footer: "— GarageIQ",

  pro_ask_prefix: "Demandez à propos de : \"%s\"",
  pro_fallback_q1: "Demandez un rapport de diagnostic complet.",
  pro_fallback_q2: "Renseignez-vous sur la garantie des pièces.",
  pro_fallback_q3: "Demandez un devis détaillé.",
  pro_fallback_p1: "Rapport de diagnostic",
  pro_fallback_p2: "Pièces de rechange appropriées",
  pro_fallback_p3: "Estimation de la main-d'œuvre",
  pro_tip_critical_1: "Faites réparer ceci immédiatement — conduire risque d'aggraver les dégâts.",
  pro_tip_critical_2: "N'ignorez pas les voyants d'avertissement.",
  pro_tip_critical_3: "Obtenez un deuxième avis de mécanicien pour vérifier les coûts.",
  pro_tip_high_1: "Planifiez une réparation dans la semaine.",
  pro_tip_high_2: "Évitez les longs trajets jusqu'à résolution.",
  pro_tip_high_3: "Documentez les symptômes pour le mécanicien.",
  pro_tip_medium_1: "Surveillez l'aggravation des symptômes.",
  pro_tip_medium_2: "Planifiez une réparation dans le mois.",
  pro_tip_medium_3: "Vérifiez les niveaux de liquides liés chaque semaine.",
  pro_tip_low_1: "Réglez cela lors de la prochaine révision.",
  pro_tip_low_2: "Surveillez la fréquence des symptômes.",
  pro_tip_low_3: "Notez tout changement de comportement du véhicule.",

  ok_btn: "OK",
  ph_vehicle_mileage: "45000",
  ph_vehicle_license: "AB-1234-CD",
  ph_vehicle_color: "p.ex. Noir, Blanc, Argent...",

  mech_screen_title: "Ateliers à proximité",
  mech_register_title: "Inscrivez votre garage",
  mech_register_desc: "Ajoutez votre garage à GarageIQ et connectez-vous avec des conducteurs près de chez vous.",
  mech_field_name: "Nom du garage",
  mech_field_phone: "Numéro de téléphone",
  mech_field_city: "Ville",
  mech_field_address: "Adresse",
  mech_field_specialties: "Spécialités",
  mech_field_hours: "Heures d'ouverture",
  mech_field_description: "Description",
  mech_field_edit_code: "Code de modification (PIN)",
  mech_field_edit_code_hint: "Vous aurez besoin de ce PIN pour modifier ou supprimer votre annonce plus tard. Gardez-le en sécurité!",
  mech_ph_name: "ex. Garage Hassan",
  mech_ph_phone: "+33 6 XX XX XX XX",
  mech_ph_city: "ex. Paris",
  mech_ph_address: "ex. 12 Rue de la Paix",
  mech_ph_hours: "ex. Lun–Sam 8h–19h",
  mech_ph_description: "Décrivez vos services et votre expérience...",
  mech_ph_edit_code: "PIN de 4+ chiffres",
  mech_submit: "Inscrire le garage",
  mech_success_title: "Garage inscrit!",
  mech_success_msg: "Votre garage est maintenant visible dans l'annuaire. Sauvegardez votre PIN pour gérer votre annonce.",
  mech_err_required: "Nom, téléphone et ville sont requis.",
  mech_err_phone: "Veuillez entrer un numéro de téléphone valide.",
  mech_err_code: "Le code de modification doit comporter au moins 4 caractères.",
  mech_err_failed: "Échec de l'inscription. Veuillez réessayer.",
  mech_spec_engine: "Moteur",
  mech_spec_brakes: "Freins",
  mech_spec_transmission: "Transmission",
  mech_spec_electrical: "Électrique",
  mech_spec_suspension: "Suspension",
  mech_spec_cooling: "Refroidissement",
  mech_spec_ac: "Climatisation",
  mech_spec_tires: "Pneus",
  mech_spec_bodywork: "Carrosserie",
  mech_spec_general: "Général",
  mech_location_use: "Utiliser ma position",
  mech_cta_title: "Vous êtes mécanicien?",
  mech_cta_desc: "Ajoutez votre garage à l'annuaire et touchez plus de conducteurs.",
  mech_cta_btn: "Inscription gratuite",
  mech_sort_distance: "Distance",
  mech_sort_rating: "Note",
  mech_sort_name: "Nom",
  mech_sort_by: "Trier par:",
  mech_open: "Ouvert",
  mech_closed: "Fermé",
  mech_call: "Appeler",
  mech_directions: "Itinéraire",
  mech_km_away: "km",
  mech_empty_title: "Aucun atelier trouvé",
  mech_empty_desc: "Soyez le premier à ajouter votre garage dans cette zone!",
  mech_loading: "Recherche des ateliers à proximité...",
  mech_city_filter: "Rechercher par ville...",
  mech_all_cities: "Toutes les villes",
  mech_manage_title: "Gérer l'annonce",
  mech_manage_desc: "Entrez votre PIN pour modifier ou supprimer votre annonce.",
  mech_delete_btn: "Supprimer l'annonce",
  mech_delete_confirm: "Cela supprimera définitivement votre annonce.",
  mech_delete_success: "Votre annonce a été supprimée.",
  mech_update_btn: "Enregistrer les modifications",
  mech_update_success: "Votre annonce a été mise à jour.",

  menu_mechanic_register: "S'inscrire comme mécanicien",
  menu_mechanic_register_desc: "Ajoutez votre garage à l'annuaire",
  screen_mechanic_register: "Inscrire le garage",

  mech_location_section: "Localisation (GPS)",
  mech_field_latitude: "Latitude",
  mech_field_longitude: "Longitude",
  mech_ph_latitude: "ex. 33.5731",
  mech_ph_longitude: "ex. -7.5898",
  mech_listing_id: "ID de l'annonce",
  mech_listing_id_ph: "Entrez l'ID de votre annonce",
  mech_listing_id_hint: "Votre ID a été affiché après l'inscription. Utilisez-le avec votre PIN pour gérer votre annonce.",
  mech_load_btn: "Charger",
  mech_done_btn: "Terminer",
  mech_cancel_btn: "Annuler",
  mech_register_tab: "Inscription",
  mech_manage_tab: "Gérer l'annonce",
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
