export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      consultation_events: {
        Row: {
          consultation_id: string
          created_at: string
          event_note: string | null
          id: string
          next_action_date: string | null
          staff_id: string | null
          status: Database["public"]["Enums"]["consultation_status"]
        }
        Insert: {
          consultation_id: string
          created_at?: string
          event_note?: string | null
          id?: string
          next_action_date?: string | null
          staff_id?: string | null
          status: Database["public"]["Enums"]["consultation_status"]
        }
        Update: {
          consultation_id?: string
          created_at?: string
          event_note?: string | null
          id?: string
          next_action_date?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["consultation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "consultation_events_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_events_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          address: string | null
          attribute_childcare: boolean | null
          attribute_disability: boolean | null
          attribute_disability_intellectual: boolean | null
          attribute_disability_mental: boolean | null
          attribute_disability_physical: boolean | null
          attribute_dv: boolean | null
          attribute_elderly: boolean | null
          attribute_foreigner: boolean | null
          attribute_lgbt: boolean | null
          attribute_low_income: boolean | null
          attribute_poverty: boolean | null
          attribute_single_parent: boolean | null
          attribute_welfare: boolean | null
          bathing_full_assist: boolean | null
          bathing_independent: boolean | null
          bathing_other: boolean | null
          bathing_other_text: string | null
          bathing_partial_assist: boolean | null
          bed_or_futon: string | null
          birth_day: number | null
          birth_month: number | null
          birth_year: number | null
          care_manager: string | null
          care_support_office: string | null
          consultation_content: string | null
          consultation_date: string
          consultation_result: string | null
          consultation_route_care_manager: boolean | null
          consultation_route_disability_center: boolean | null
          consultation_route_elderly_center: boolean | null
          consultation_route_family: boolean | null
          consultation_route_government: boolean | null
          consultation_route_government_other: string | null
          consultation_route_other: boolean | null
          consultation_route_other_text: string | null
          consultation_route_self: boolean | null
          cooking_possible: boolean | null
          cooking_support_needed: boolean | null
          cooking_support_text: string | null
          created_at: string
          current_floor_plan: string | null
          current_rent: number | null
          dementia: string | null
          dementia_hospital: string | null
          diaper_usage: boolean | null
          eating_full_assist: boolean | null
          eating_independent: boolean | null
          eating_other: boolean | null
          eating_other_text: string | null
          eating_partial_assist: boolean | null
          emergency_contact_address: string | null
          emergency_contact_email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone_home: string | null
          emergency_contact_phone_mobile: string | null
          emergency_contact_postal_code: string | null
          emergency_contact_relationship: string | null
          eviction_date: string | null
          eviction_date_notes: string | null
          excretion_full_assist: boolean | null
          excretion_independent: boolean | null
          excretion_other: boolean | null
          excretion_other_text: string | null
          excretion_partial_assist: boolean | null
          furigana: string | null
          garbage_disposal_independent: boolean | null
          garbage_disposal_support_needed: boolean | null
          garbage_disposal_support_text: string | null
          gender: string | null
          hospital_support_required: boolean | null
          household_acquaintance: boolean | null
          household_common_law: boolean | null
          household_couple: boolean | null
          household_other: boolean | null
          household_other_text: string | null
          household_parent_child: boolean | null
          household_siblings: boolean | null
          household_single: boolean | null
          id: string
          income_injury_allowance: number | null
          income_pension: number | null
          income_salary: number | null
          is_relocation_to_other_city_desired: boolean | null
          medical_history: string | null
          medical_institution_name: string | null
          medical_institution_staff: string | null
          medication_management_needed: boolean | null
          mental_disability_certificate: boolean | null
          mental_disability_level: string | null
          mobility_aids: string | null
          mobility_full_assist: boolean | null
          mobility_independent: boolean | null
          mobility_other: boolean | null
          mobility_other_text: string | null
          mobility_partial_assist: boolean | null
          money_management: string | null
          money_management_supporter: string | null
          name: string | null
          next_appointment_details: string | null
          next_appointment_scheduled: boolean | null
          other_notes: string | null
          pet_details: string | null
          pet_status: string | null
          phone_home: string | null
          phone_mobile: string | null
          physical_condition: string | null
          physical_disability_certificate: boolean | null
          physical_disability_level: string | null
          postal_code: string | null
          proxy_payment: boolean | null
          relocation_admin_opinion: string | null
          relocation_admin_opinion_details: string | null
          relocation_cost_bearer: string | null
          relocation_cost_bearer_details: string | null
          relocation_notes: string | null
          relocation_reason: string | null
          rent_arrears_details: string | null
          rent_arrears_duration: string | null
          rent_arrears_status: string | null
          rent_payment_method: string | null
          savings: number | null
          second_floor_possible: boolean | null
          service_day_service: boolean | null
          service_home_medical: boolean | null
          service_other: boolean | null
          service_other_text: string | null
          service_provider: string | null
          service_short_stay: boolean | null
          service_visiting_care: boolean | null
          service_visiting_nurse: boolean | null
          shopping_possible: boolean | null
          shopping_support_needed: boolean | null
          shopping_support_text: string | null
          staff_id: string | null
          stairs_full_assist: boolean | null
          stairs_independent: boolean | null
          stairs_other: boolean | null
          stairs_other_text: string | null
          stairs_partial_assist: boolean | null
          status: string
          supporter_available: boolean | null
          supporter_text: string | null
          therapy_certificate: boolean | null
          therapy_level: string | null
          unit_bath_possible: boolean | null
          updated_at: string
          user_id: string | null
          vehicle_bicycle: boolean
          vehicle_car: boolean
          vehicle_motorcycle: boolean
          vehicle_none: boolean
          welfare_recipient: boolean | null
          welfare_staff: string | null
        }
        Insert: {
          address?: string | null
          attribute_childcare?: boolean | null
          attribute_disability?: boolean | null
          attribute_disability_intellectual?: boolean | null
          attribute_disability_mental?: boolean | null
          attribute_disability_physical?: boolean | null
          attribute_dv?: boolean | null
          attribute_elderly?: boolean | null
          attribute_foreigner?: boolean | null
          attribute_lgbt?: boolean | null
          attribute_low_income?: boolean | null
          attribute_poverty?: boolean | null
          attribute_single_parent?: boolean | null
          attribute_welfare?: boolean | null
          bathing_full_assist?: boolean | null
          bathing_independent?: boolean | null
          bathing_other?: boolean | null
          bathing_other_text?: string | null
          bathing_partial_assist?: boolean | null
          bed_or_futon?: string | null
          birth_day?: number | null
          birth_month?: number | null
          birth_year?: number | null
          care_manager?: string | null
          care_support_office?: string | null
          consultation_content?: string | null
          consultation_date: string
          consultation_result?: string | null
          consultation_route_care_manager?: boolean | null
          consultation_route_disability_center?: boolean | null
          consultation_route_elderly_center?: boolean | null
          consultation_route_family?: boolean | null
          consultation_route_government?: boolean | null
          consultation_route_government_other?: string | null
          consultation_route_other?: boolean | null
          consultation_route_other_text?: string | null
          consultation_route_self?: boolean | null
          cooking_possible?: boolean | null
          cooking_support_needed?: boolean | null
          cooking_support_text?: string | null
          created_at?: string
          current_floor_plan?: string | null
          current_rent?: number | null
          dementia?: string | null
          dementia_hospital?: string | null
          diaper_usage?: boolean | null
          eating_full_assist?: boolean | null
          eating_independent?: boolean | null
          eating_other?: boolean | null
          eating_other_text?: string | null
          eating_partial_assist?: boolean | null
          emergency_contact_address?: string | null
          emergency_contact_email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone_home?: string | null
          emergency_contact_phone_mobile?: string | null
          emergency_contact_postal_code?: string | null
          emergency_contact_relationship?: string | null
          eviction_date?: string | null
          eviction_date_notes?: string | null
          excretion_full_assist?: boolean | null
          excretion_independent?: boolean | null
          excretion_other?: boolean | null
          excretion_other_text?: string | null
          excretion_partial_assist?: boolean | null
          furigana?: string | null
          garbage_disposal_independent?: boolean | null
          garbage_disposal_support_needed?: boolean | null
          garbage_disposal_support_text?: string | null
          gender?: string | null
          hospital_support_required?: boolean | null
          household_acquaintance?: boolean | null
          household_common_law?: boolean | null
          household_couple?: boolean | null
          household_other?: boolean | null
          household_other_text?: string | null
          household_parent_child?: boolean | null
          household_siblings?: boolean | null
          household_single?: boolean | null
          id?: string
          income_injury_allowance?: number | null
          income_pension?: number | null
          income_salary?: number | null
          is_relocation_to_other_city_desired?: boolean | null
          medical_history?: string | null
          medical_institution_name?: string | null
          medical_institution_staff?: string | null
          medication_management_needed?: boolean | null
          mental_disability_certificate?: boolean | null
          mental_disability_level?: string | null
          mobility_aids?: string | null
          mobility_full_assist?: boolean | null
          mobility_independent?: boolean | null
          mobility_other?: boolean | null
          mobility_other_text?: string | null
          mobility_partial_assist?: boolean | null
          money_management?: string | null
          money_management_supporter?: string | null
          name?: string | null
          next_appointment_details?: string | null
          next_appointment_scheduled?: boolean | null
          other_notes?: string | null
          pet_details?: string | null
          pet_status?: string | null
          phone_home?: string | null
          phone_mobile?: string | null
          physical_condition?: string | null
          physical_disability_certificate?: boolean | null
          physical_disability_level?: string | null
          postal_code?: string | null
          proxy_payment?: boolean | null
          relocation_admin_opinion?: string | null
          relocation_admin_opinion_details?: string | null
          relocation_cost_bearer?: string | null
          relocation_cost_bearer_details?: string | null
          relocation_notes?: string | null
          relocation_reason?: string | null
          rent_arrears_details?: string | null
          rent_arrears_duration?: string | null
          rent_arrears_status?: string | null
          rent_payment_method?: string | null
          savings?: number | null
          second_floor_possible?: boolean | null
          service_day_service?: boolean | null
          service_home_medical?: boolean | null
          service_other?: boolean | null
          service_other_text?: string | null
          service_provider?: string | null
          service_short_stay?: boolean | null
          service_visiting_care?: boolean | null
          service_visiting_nurse?: boolean | null
          shopping_possible?: boolean | null
          shopping_support_needed?: boolean | null
          shopping_support_text?: string | null
          staff_id?: string | null
          stairs_full_assist?: boolean | null
          stairs_independent?: boolean | null
          stairs_other?: boolean | null
          stairs_other_text?: string | null
          stairs_partial_assist?: boolean | null
          status?: string
          supporter_available?: boolean | null
          supporter_text?: string | null
          therapy_certificate?: boolean | null
          therapy_level?: string | null
          unit_bath_possible?: boolean | null
          updated_at?: string
          user_id?: string | null
          vehicle_bicycle?: boolean
          vehicle_car?: boolean
          vehicle_motorcycle?: boolean
          vehicle_none?: boolean
          welfare_recipient?: boolean | null
          welfare_staff?: string | null
        }
        Update: {
          address?: string | null
          attribute_childcare?: boolean | null
          attribute_disability?: boolean | null
          attribute_disability_intellectual?: boolean | null
          attribute_disability_mental?: boolean | null
          attribute_disability_physical?: boolean | null
          attribute_dv?: boolean | null
          attribute_elderly?: boolean | null
          attribute_foreigner?: boolean | null
          attribute_lgbt?: boolean | null
          attribute_low_income?: boolean | null
          attribute_poverty?: boolean | null
          attribute_single_parent?: boolean | null
          attribute_welfare?: boolean | null
          bathing_full_assist?: boolean | null
          bathing_independent?: boolean | null
          bathing_other?: boolean | null
          bathing_other_text?: string | null
          bathing_partial_assist?: boolean | null
          bed_or_futon?: string | null
          birth_day?: number | null
          birth_month?: number | null
          birth_year?: number | null
          care_manager?: string | null
          care_support_office?: string | null
          consultation_content?: string | null
          consultation_date?: string
          consultation_result?: string | null
          consultation_route_care_manager?: boolean | null
          consultation_route_disability_center?: boolean | null
          consultation_route_elderly_center?: boolean | null
          consultation_route_family?: boolean | null
          consultation_route_government?: boolean | null
          consultation_route_government_other?: string | null
          consultation_route_other?: boolean | null
          consultation_route_other_text?: string | null
          consultation_route_self?: boolean | null
          cooking_possible?: boolean | null
          cooking_support_needed?: boolean | null
          cooking_support_text?: string | null
          created_at?: string
          current_floor_plan?: string | null
          current_rent?: number | null
          dementia?: string | null
          dementia_hospital?: string | null
          diaper_usage?: boolean | null
          eating_full_assist?: boolean | null
          eating_independent?: boolean | null
          eating_other?: boolean | null
          eating_other_text?: string | null
          eating_partial_assist?: boolean | null
          emergency_contact_address?: string | null
          emergency_contact_email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone_home?: string | null
          emergency_contact_phone_mobile?: string | null
          emergency_contact_postal_code?: string | null
          emergency_contact_relationship?: string | null
          eviction_date?: string | null
          eviction_date_notes?: string | null
          excretion_full_assist?: boolean | null
          excretion_independent?: boolean | null
          excretion_other?: boolean | null
          excretion_other_text?: string | null
          excretion_partial_assist?: boolean | null
          furigana?: string | null
          garbage_disposal_independent?: boolean | null
          garbage_disposal_support_needed?: boolean | null
          garbage_disposal_support_text?: string | null
          gender?: string | null
          hospital_support_required?: boolean | null
          household_acquaintance?: boolean | null
          household_common_law?: boolean | null
          household_couple?: boolean | null
          household_other?: boolean | null
          household_other_text?: string | null
          household_parent_child?: boolean | null
          household_siblings?: boolean | null
          household_single?: boolean | null
          id?: string
          income_injury_allowance?: number | null
          income_pension?: number | null
          income_salary?: number | null
          is_relocation_to_other_city_desired?: boolean | null
          medical_history?: string | null
          medical_institution_name?: string | null
          medical_institution_staff?: string | null
          medication_management_needed?: boolean | null
          mental_disability_certificate?: boolean | null
          mental_disability_level?: string | null
          mobility_aids?: string | null
          mobility_full_assist?: boolean | null
          mobility_independent?: boolean | null
          mobility_other?: boolean | null
          mobility_other_text?: string | null
          mobility_partial_assist?: boolean | null
          money_management?: string | null
          money_management_supporter?: string | null
          name?: string | null
          next_appointment_details?: string | null
          next_appointment_scheduled?: boolean | null
          other_notes?: string | null
          pet_details?: string | null
          pet_status?: string | null
          phone_home?: string | null
          phone_mobile?: string | null
          physical_condition?: string | null
          physical_disability_certificate?: boolean | null
          physical_disability_level?: string | null
          postal_code?: string | null
          proxy_payment?: boolean | null
          relocation_admin_opinion?: string | null
          relocation_admin_opinion_details?: string | null
          relocation_cost_bearer?: string | null
          relocation_cost_bearer_details?: string | null
          relocation_notes?: string | null
          relocation_reason?: string | null
          rent_arrears_details?: string | null
          rent_arrears_duration?: string | null
          rent_arrears_status?: string | null
          rent_payment_method?: string | null
          savings?: number | null
          second_floor_possible?: boolean | null
          service_day_service?: boolean | null
          service_home_medical?: boolean | null
          service_other?: boolean | null
          service_other_text?: string | null
          service_provider?: string | null
          service_short_stay?: boolean | null
          service_visiting_care?: boolean | null
          service_visiting_nurse?: boolean | null
          shopping_possible?: boolean | null
          shopping_support_needed?: boolean | null
          shopping_support_text?: string | null
          staff_id?: string | null
          stairs_full_assist?: boolean | null
          stairs_independent?: boolean | null
          stairs_other?: boolean | null
          stairs_other_text?: string | null
          stairs_partial_assist?: boolean | null
          status?: string
          supporter_available?: boolean | null
          supporter_text?: string | null
          therapy_certificate?: boolean | null
          therapy_level?: string | null
          unit_bath_possible?: boolean | null
          updated_at?: string
          user_id?: string | null
          vehicle_bicycle?: boolean
          vehicle_car?: boolean
          vehicle_motorcycle?: boolean
          vehicle_none?: boolean
          welfare_recipient?: boolean | null
          welfare_staff?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      support_plans: {
        Row: {
          birth_date: string
          care_level_care1: boolean | null
          care_level_care2: boolean | null
          care_level_care3: boolean | null
          care_level_care4: boolean | null
          care_level_care5: boolean | null
          care_level_independent: boolean | null
          care_level_support1: boolean | null
          care_level_support2: boolean | null
          created_at: string
          creation_date: string
          evacuation_plan_completed: boolean | null
          evacuation_plan_other_details: string | null
          furigana: string
          goals: string | null
          home_oxygen: boolean | null
          id: string
          line_available: boolean | null
          mental_disability_level: string | null
          monitoring_hello_light: boolean | null
          monitoring_hello_light_details: string | null
          monitoring_secom: boolean | null
          monitoring_secom_details: string | null
          name: string
          needs_environment: string | null
          needs_financial: string | null
          needs_lifestyle: string | null
          needs_mental: string | null
          needs_physical: string | null
          outpatient_care: boolean | null
          outpatient_institution: string | null
          pension_corporate: boolean | null
          pension_disability: boolean | null
          pension_employee: boolean | null
          pension_national: boolean | null
          pension_other: boolean | null
          pension_other_details: string | null
          pension_survivor: boolean | null
          phone_mobile: string | null
          physical_disability_level: string | null
          residence: string
          staff_id: string | null
          support_bank_visit: boolean | null
          support_bulb_change: boolean | null
          support_cleaning: boolean | null
          support_garbage_disposal: boolean | null
          support_shopping: boolean | null
          therapy_certificate_level: string | null
          updated_at: string
          user_id: string
          visiting_medical: boolean | null
          visiting_medical_institution: string | null
          welfare_contact: string | null
          welfare_recipient: boolean | null
          welfare_worker: string | null
        }
        Insert: {
          birth_date: string
          care_level_care1?: boolean | null
          care_level_care2?: boolean | null
          care_level_care3?: boolean | null
          care_level_care4?: boolean | null
          care_level_care5?: boolean | null
          care_level_independent?: boolean | null
          care_level_support1?: boolean | null
          care_level_support2?: boolean | null
          created_at?: string
          creation_date: string
          evacuation_plan_completed?: boolean | null
          evacuation_plan_other_details?: string | null
          furigana: string
          goals?: string | null
          home_oxygen?: boolean | null
          id?: string
          line_available?: boolean | null
          mental_disability_level?: string | null
          monitoring_hello_light?: boolean | null
          monitoring_hello_light_details?: string | null
          monitoring_secom?: boolean | null
          monitoring_secom_details?: string | null
          name: string
          needs_environment?: string | null
          needs_financial?: string | null
          needs_lifestyle?: string | null
          needs_mental?: string | null
          needs_physical?: string | null
          outpatient_care?: boolean | null
          outpatient_institution?: string | null
          pension_corporate?: boolean | null
          pension_disability?: boolean | null
          pension_employee?: boolean | null
          pension_national?: boolean | null
          pension_other?: boolean | null
          pension_other_details?: string | null
          pension_survivor?: boolean | null
          phone_mobile?: string | null
          physical_disability_level?: string | null
          residence: string
          staff_id?: string | null
          support_bank_visit?: boolean | null
          support_bulb_change?: boolean | null
          support_cleaning?: boolean | null
          support_garbage_disposal?: boolean | null
          support_shopping?: boolean | null
          therapy_certificate_level?: string | null
          updated_at?: string
          user_id: string
          visiting_medical?: boolean | null
          visiting_medical_institution?: string | null
          welfare_contact?: string | null
          welfare_recipient?: boolean | null
          welfare_worker?: string | null
        }
        Update: {
          birth_date?: string
          care_level_care1?: boolean | null
          care_level_care2?: boolean | null
          care_level_care3?: boolean | null
          care_level_care4?: boolean | null
          care_level_care5?: boolean | null
          care_level_independent?: boolean | null
          care_level_support1?: boolean | null
          care_level_support2?: boolean | null
          created_at?: string
          creation_date?: string
          evacuation_plan_completed?: boolean | null
          evacuation_plan_other_details?: string | null
          furigana?: string
          goals?: string | null
          home_oxygen?: boolean | null
          id?: string
          line_available?: boolean | null
          mental_disability_level?: string | null
          monitoring_hello_light?: boolean | null
          monitoring_hello_light_details?: string | null
          monitoring_secom?: boolean | null
          monitoring_secom_details?: string | null
          name?: string
          needs_environment?: string | null
          needs_financial?: string | null
          needs_lifestyle?: string | null
          needs_mental?: string | null
          needs_physical?: string | null
          outpatient_care?: boolean | null
          outpatient_institution?: string | null
          pension_corporate?: boolean | null
          pension_disability?: boolean | null
          pension_employee?: boolean | null
          pension_national?: boolean | null
          pension_other?: boolean | null
          pension_other_details?: string | null
          pension_survivor?: boolean | null
          phone_mobile?: string | null
          physical_disability_level?: string | null
          residence?: string
          staff_id?: string | null
          support_bank_visit?: boolean | null
          support_bulb_change?: boolean | null
          support_cleaning?: boolean | null
          support_garbage_disposal?: boolean | null
          support_shopping?: boolean | null
          therapy_certificate_level?: string | null
          updated_at?: string
          user_id?: string
          visiting_medical?: boolean | null
          visiting_medical_institution?: string | null
          welfare_contact?: string | null
          welfare_recipient?: boolean | null
          welfare_worker?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_plans_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          birth_date: string | null
          common_fee: number | null
          created_at: string
          deposit: number | null
          emergency_contact: string | null
          emergency_contact_name: string | null
          fire_insurance: number | null
          gender: string | null
          id: string
          intermediary: string | null
          key_money: number | null
          landlord_common_fee: number | null
          landlord_rent: number | null
          line_available: boolean | null
          monitoring_system: string | null
          move_in_date: string | null
          name: string
          next_renewal_date: string | null
          notes: string | null
          posthumous_affairs: boolean | null
          property_address: string | null
          property_name: string | null
          proxy_payment_eligible: boolean | null
          registered_at: string
          relationship: string | null
          renewal_count: number | null
          rent: number | null
          rent_difference: number | null
          resident_contact: string | null
          room_number: string | null
          support_medical_institution: string | null
          uid: string
          updated_at: string
          welfare_recipient: boolean | null
        }
        Insert: {
          birth_date?: string | null
          common_fee?: number | null
          created_at?: string
          deposit?: number | null
          emergency_contact?: string | null
          emergency_contact_name?: string | null
          fire_insurance?: number | null
          gender?: string | null
          id?: string
          intermediary?: string | null
          key_money?: number | null
          landlord_common_fee?: number | null
          landlord_rent?: number | null
          line_available?: boolean | null
          monitoring_system?: string | null
          move_in_date?: string | null
          name: string
          next_renewal_date?: string | null
          notes?: string | null
          posthumous_affairs?: boolean | null
          property_address?: string | null
          property_name?: string | null
          proxy_payment_eligible?: boolean | null
          registered_at?: string
          relationship?: string | null
          renewal_count?: number | null
          rent?: number | null
          rent_difference?: number | null
          resident_contact?: string | null
          room_number?: string | null
          support_medical_institution?: string | null
          uid: string
          updated_at?: string
          welfare_recipient?: boolean | null
        }
        Update: {
          birth_date?: string | null
          common_fee?: number | null
          created_at?: string
          deposit?: number | null
          emergency_contact?: string | null
          emergency_contact_name?: string | null
          fire_insurance?: number | null
          gender?: string | null
          id?: string
          intermediary?: string | null
          key_money?: number | null
          landlord_common_fee?: number | null
          landlord_rent?: number | null
          line_available?: boolean | null
          monitoring_system?: string | null
          move_in_date?: string | null
          name?: string
          next_renewal_date?: string | null
          notes?: string | null
          posthumous_affairs?: boolean | null
          property_address?: string | null
          property_name?: string | null
          proxy_payment_eligible?: boolean | null
          registered_at?: string
          relationship?: string | null
          renewal_count?: number | null
          rent?: number | null
          rent_difference?: number | null
          resident_contact?: string | null
          room_number?: string | null
          support_medical_institution?: string | null
          uid?: string
          updated_at?: string
          welfare_recipient?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_age: {
        Args: { birth_day: number; birth_month: number; birth_year: number }
        Returns: number
      }
    }
    Enums: {
      consultation_status:
        | "進行中"
        | "初回面談"
        | "支援検討中"
        | "物件探し中"
        | "申込・審査中"
        | "入居後フォロー中"
        | "支援終了"
        | "対象外・辞退"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      consultation_status: [
        "進行中",
        "初回面談",
        "支援検討中",
        "物件探し中",
        "申込・審査中",
        "入居後フォロー中",
        "支援終了",
        "対象外・辞退",
      ],
    },
  },
} as const

