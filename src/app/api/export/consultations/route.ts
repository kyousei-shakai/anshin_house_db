// src/app/api/export/consultations/route.ts

import { NextResponse } from 'next/server'
import { consultationsApi } from '@/lib/api'
import { Database } from '@/types/database'
import XlsxPopulate from 'xlsx-populate'
import path from 'path'
import fs from 'fs/promises'
// ▼▼▼ 追加 ▼▼▼ 共通ヘルパー関数をインポート
import { 
    getRelocationAdminOpinionLabel, 
    getRelocationCostBearerLabel, 
    getRentArrearsDurationLabel 
} from '@/utils/export'

type Consultation = Database['public']['Tables']['consultations']['Row']

// --- このファイルにローカルなヘルパー関数群 ---
const calculateAgeFromYMD = (year: number | null, month: number | null, day: number | null): number | '' => {
    if (!year || !month || !day) return '';
    try {
        const birthDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const today = new Date();
        const birth = new Date(birthDateStr);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    } catch { return ''; }
}
const toJapaneseEra = (year: number, month: number, day: number): { era: string; year: number } | null => {
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return null;
    if (date >= new Date(2019, 4, 1)) return { era: '令和', year: year - 2018 };
    if (date >= new Date(1989, 0, 8)) return { era: '平成', year: year - 1988 };
    if (date >= new Date(1926, 11, 25)) return { era: '昭和', year: year - 1925 };
    if (date >= new Date(1912, 6, 30)) return { era: '大正', year: year - 1911 };
    if (date >= new Date(1868, 0, 25)) return { era: '明治', year: year - 1867 };
    return null;
};
const sanitizeSheetName = (name: string): string => {
  if (!name) return '無題';
  const sanitized = name.replace(/[:\\/?*[\]]/g, '_');
  return sanitized.substring(0, 31);
};

const createReplacements = (consultation: Consultation): Record<string, string | number> => {
    const check = (value: boolean | null | undefined) => value ? '✔' : '□';
    const cDate = new Date(consultation.consultation_date);
    const age = calculateAgeFromYMD(consultation.birth_year, consultation.birth_month, consultation.birth_day);
    const japaneseEra = consultation.birth_year && consultation.birth_month && consultation.birth_day
        ? toJapaneseEra(consultation.birth_year, consultation.birth_month, consultation.birth_day)
        : null;

    type PhysicalConditionKey = 'independent' | 'support1' | 'support2' | 'care1' | 'care2' | 'care3' | 'care4' | 'care5';
    const physicalConditionMap: Record<PhysicalConditionKey, string> = {
        'independent': '自立', 'support1': '要支援1', 'support2': '要支援2', 'care1': '要介護1',
        'care2': '要介護2', 'care3': '要介護3', 'care4': '要介護4', 'care5': '要介護5'
    };
    
    const getAdlStatus = (isIndependent: boolean | null, isPartial: boolean | null, isFull: boolean | null, isOther: boolean | null) => {
        if (isIndependent) return '自立';
        if (isPartial) return '一部介助';
        if (isFull) return '全介助';
        if (isOther) return 'その他';
        return '';
    };

    const getShoppingStatus = (isPossible: boolean | null, isSupportNeeded: boolean | null) => {
        if (isPossible) return '可';
        if (isSupportNeeded) return '支援必要';
        return '';
    };

    const getGarbageDisposalStatus = (isIndependent: boolean | null, isSupportNeeded: boolean | null) => {
        if (isIndependent) return '自立';
        if (isSupportNeeded) return '支援必要';
        return '';
    };
    
    const getSecondFloorStatus = (value: boolean | null) => {
        if (value === true) return '可';
        if (value === false) return '不可';
        return '';
    };
    
    const getRentPaymentMethod = (status: string | null) => {
        const map: Record<string, string> = {'transfer': '振込', 'collection': '集金', 'automatic': '口座振替'};
        return status ? map[status] || '' : '';
    };

    const vehicleText = [
        consultation.vehicle_car && '車',
        consultation.vehicle_motorcycle && 'バイク',
        consultation.vehicle_bicycle && '自転車',
        consultation.vehicle_none && 'なし'
    ].filter(Boolean).join('・');

    const physicalConditionKey = consultation.physical_condition as PhysicalConditionKey;

    return {
        '{{consultation_date_year}}': cDate.getFullYear(), '{{consultation_date_month}}': cDate.getMonth() + 1, '{{consultation_date_day}}': cDate.getDate(),
        '{{staff_name}}': consultation.staff_name || '', '{{route_self}}': check(consultation.consultation_route_self),
        '{{route_family}}': check(consultation.consultation_route_family), '{{route_care_manager}}': check(consultation.consultation_route_care_manager),
        '{{route_elderly_center}}': check(consultation.consultation_route_elderly_center), '{{route_disability_center}}': check(consultation.consultation_route_disability_center),
        '{{route_government}}': check(consultation.consultation_route_government), '{{route_government_other}}': consultation.consultation_route_government_other || '',
        '{{route_other}}': check(consultation.consultation_route_other), '{{route_other_text}}': consultation.consultation_route_other_text || '',
        '{{attr_elderly}}': check(consultation.attribute_elderly), '{{attr_disability}}': check(consultation.attribute_disability),
        '{{attr_disability_mental}}': check(consultation.attribute_disability_mental), '{{attr_disability_physical}}': check(consultation.attribute_disability_physical),
        '{{attr_disability_intellectual}}': check(consultation.attribute_disability_intellectual), '{{attr_childcare}}': check(consultation.attribute_childcare),
        '{{attr_single_parent}}': check(consultation.attribute_single_parent), '{{attr_dv}}': check(consultation.attribute_dv),
        '{{attr_foreigner}}': check(consultation.attribute_foreigner), '{{attr_poverty}}': check(consultation.attribute_poverty),
        '{{attr_low_income}}': check(consultation.attribute_low_income), '{{attr_lgbt}}': check(consultation.attribute_lgbt),
        '{{attr_welfare}}': check(consultation.attribute_welfare), '{{name}}': consultation.name || '', '{{furigana}}': consultation.furigana || '',
        '{{gender}}': consultation.gender === 'male' ? '男' : consultation.gender === 'female' ? '女' : 'その他',
        '{{household_single}}': check(consultation.household_single), '{{household_couple}}': check(consultation.household_couple),
        '{{household_common_law}}': check(consultation.household_common_law), '{{household_parent_child}}': check(consultation.household_parent_child),
        '{{household_siblings}}': check(consultation.household_siblings), '{{household_acquaintance}}': check(consultation.household_acquaintance),
        '{{household_other}}': check(consultation.household_other), '{{household_other_text}}': consultation.household_other_text || '',
        '{{postal_code}}': consultation.postal_code || '', '{{address}}': consultation.address || '', '{{phone_home}}': consultation.phone_home || '',
        '{{phone_mobile}}': consultation.phone_mobile || '',
        '{{birth_era_name}}': japaneseEra ? japaneseEra.era : '西暦', // プレースホルダー名を修正
        '{{birth_year}}': japaneseEra ? japaneseEra.year : consultation.birth_year || '',
        '{{birth_month}}': consultation.birth_month || '', '{{birth_day}}': consultation.birth_day || '', '{{age}}': age,
        '{{physical_condition}}': consultation.physical_condition ? physicalConditionMap[physicalConditionKey] || '' : '',
        '{{mental_cert}}': check(consultation.mental_disability_certificate), '{{mental_cert_level}}': consultation.mental_disability_level || '',
        '{{physical_cert}}': check(consultation.physical_disability_certificate), '{{physical_cert_level}}': consultation.physical_disability_level || '',
        '{{therapy_cert}}': check(consultation.therapy_certificate), '{{therapy_cert_level}}': consultation.therapy_level || '',
        '{{service_day}}': check(consultation.service_day_service), '{{service_nurse}}': check(consultation.service_visiting_nurse),
        '{{service_care}}': check(consultation.service_visiting_care), '{{service_medical}}': check(consultation.service_home_medical),
        '{{service_short_stay}}': check(consultation.service_short_stay), '{{service_other}}': check(consultation.service_other),
        '{{service_other_text}}': consultation.service_other_text || '', '{{service_provider}}': consultation.service_provider || '',
        '{{care_support_office}}': consultation.care_support_office || '', '{{care_manager}}': consultation.care_manager || '',
        '{{medical_history}}': consultation.medical_history || '', '{{med_inst_name}}': consultation.medical_institution_name || '',
        '{{med_inst_staff}}': consultation.medical_institution_staff || '', '{{income_salary}}': consultation.income_salary || '',
        '{{income_injury}}': consultation.income_injury_allowance || '', '{{income_pension}}': consultation.income_pension || '',
        '{{welfare_recipient}}': check(consultation.welfare_recipient), '{{welfare_staff}}': consultation.welfare_staff || '',
        '{{savings}}': consultation.savings || '', '{{dementia_level}}': consultation.dementia || '', '{{dementia_hospital}}': consultation.dementia_hospital || '',
        '{{hospital_support}}': consultation.hospital_support_required ? '要' : '不要', '{{medication_manage}}': consultation.medication_management_needed ? '有' : '無',
        '{{mobility_status}}': getAdlStatus(consultation.mobility_independent, consultation.mobility_partial_assist, consultation.mobility_full_assist, consultation.mobility_other),
        '{{mobility_other_text}}': consultation.mobility_other_text || '', '{{mobility_aids}}': consultation.mobility_aids || '',
        '{{eating_status}}': getAdlStatus(consultation.eating_independent, consultation.eating_partial_assist, consultation.eating_full_assist, consultation.eating_other),
        '{{eating_other_text}}': consultation.eating_other_text || '',
        '{{shopping_status}}': getShoppingStatus(consultation.shopping_possible, consultation.shopping_support_needed),
        '{{shopping_support_text}}': consultation.shopping_support_text || '',
        '{{garbage_disposal_status}}': getGarbageDisposalStatus(consultation.garbage_disposal_independent, consultation.garbage_disposal_support_needed),
        '{{garbage_disposal_support_text}}': consultation.garbage_disposal_support_text || '',
        '{{excretion_status}}': getAdlStatus(consultation.excretion_independent, consultation.excretion_partial_assist, consultation.excretion_full_assist, consultation.excretion_other),
        '{{excretion_other_text}}': consultation.excretion_other_text || '',
        '{{second_floor_status}}': getSecondFloorStatus(consultation.second_floor_possible),
        '{{bathing_status}}': getAdlStatus(consultation.bathing_independent, consultation.bathing_partial_assist, consultation.bathing_full_assist, consultation.bathing_other),
        '{{bathing_other_text}}': consultation.bathing_other_text || '',
        '{{money_manager}}': consultation.money_management_supporter || '',
        '{{proxy_payment}}': consultation.proxy_payment ? '有' : '無',
        '{{rent_payment_method}}': getRentPaymentMethod(consultation.rent_payment_method), 
        
        '{{is_relocation_to_other_city_desired}}': consultation.is_relocation_to_other_city_desired === true ? 'はい' : consultation.is_relocation_to_other_city_desired === false ? 'いいえ' : '',
        '{{relocation_admin_opinion}}': getRelocationAdminOpinionLabel(consultation.relocation_admin_opinion, consultation.relocation_admin_opinion_details),
        '{{relocation_admin_opinion_details}}': consultation.relocation_admin_opinion_details || '',
        '{{relocation_cost_bearer}}': getRelocationCostBearerLabel(consultation.relocation_cost_bearer, consultation.relocation_cost_bearer_details),
        '{{relocation_cost_bearer_details}}': consultation.relocation_cost_bearer_details || '',
        '{{relocation_notes}}': consultation.relocation_notes || '',
        '{{rent_arrears_status}}': consultation.rent_arrears_status === 'yes' ? '有り' : consultation.rent_arrears_status === 'no' ? '無し' : '',
        '{{rent_arrears_duration}}': getRentArrearsDurationLabel(consultation.rent_arrears_duration, null),
        '{{rent_arrears_details}}': consultation.rent_arrears_details || '',
        '{{pet_status}}': consultation.pet_status === 'yes' ? '有り' : consultation.pet_status === 'no' ? '無し' : '',
        '{{pet_details}}': consultation.pet_details || '',
        '{{vehicle}}': vehicleText,
        '{{current_floor_plan}}': consultation.current_floor_plan || '',
        '{{current_rent}}': consultation.current_rent || '',
        '{{eviction_date}}': consultation.eviction_date ? new Date(consultation.eviction_date).toLocaleDateString('ja-JP') : '',
        '{{eviction_date_notes}}': consultation.eviction_date_notes || '',
        
        '{{other_notes}}': consultation.other_notes || '',
        '{{consultation_content}}': consultation.consultation_content || '', '{{relocation_reason}}': consultation.relocation_reason || '',
        '{{emergency_name}}': consultation.emergency_contact_name || '', '{{emergency_relationship}}': consultation.emergency_contact_relationship || '',
        '{{emergency_postal_code}}': consultation.emergency_contact_postal_code || '', '{{emergency_address}}': consultation.emergency_contact_address || '',
        '{{emergency_phone_home}}': consultation.emergency_contact_phone_home || '', '{{emergency_phone_mobile}}': consultation.emergency_contact_phone_mobile || '',
        '{{emergency_email}}': consultation.emergency_contact_email || '', '{{consultation_result}}': consultation.consultation_result || '',
        '{{next_appointment}}': consultation.next_appointment_scheduled ? 'あり' : 'なし', '{{next_appointment_details}}': consultation.next_appointment_details || '',
    };
};

export async function POST(request: Request) {
  try {
    const { consultationIds } = await request.json();
    if (!consultationIds || !Array.isArray(consultationIds)) {
      return new NextResponse('Invalid request body', { status: 400 });
    }
    
    const { data: allConsultations, error: fetchError } = await consultationsApi.getAllWithAllColumns();
    if (fetchError) throw fetchError;

    // ▼▼▼ 修正 ▼▼▼ NULLチェックを追加
    const validConsultations = allConsultations || [];
    const consultations = validConsultations.filter(c => consultationIds.includes(c.id));

    const templatePath = path.resolve(process.cwd(), 'public', 'consultation_template.xlsx');
    const templateData = await fs.readFile(templatePath);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workbook: any = await XlsxPopulate.fromDataAsync(templateData);
    const templateSheet = workbook.sheet("テンプレート");
    
    if (!templateSheet) {
      throw new Error("Template sheet named 'テンプレート' not found.");
    }

    for (const [index, consultation] of consultations.entries()) {
        const newSheetName = sanitizeSheetName(consultation.name || `無名_${index + 1}`);
        let finalSheetName = newSheetName;
        let count = 2;
        while(workbook.sheet(finalSheetName)) {
            finalSheetName = `${newSheetName.substring(0, 31 - `(${count})`.length)}(${count})`;
            count++;
        }
        
        workbook.cloneSheet(templateSheet, finalSheetName);
        const newSheet = workbook.sheet(finalSheetName);
        const replacements = createReplacements(consultation);
        
        if (newSheet.usedRange()) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            newSheet.usedRange().forEach((cell: any) => {
                let cellValue = cell.value();
                if (typeof cellValue === 'string') {
                    for (const key in replacements) {
                        const placeholder = new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                        if (placeholder.test(cellValue)) {
                            const replacementValue = (replacements as Record<string, string | number>)[key];
                            cellValue = cellValue.replace(placeholder, String(replacementValue));
                        }
                    }
                    cell.value(cellValue);
                }
            });
        }
    }

    templateSheet.delete();
    const buffer = await workbook.outputAsync();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="consultations.xlsx"`,
      },
    });

  } catch (error) {
    console.error("API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new NextResponse(JSON.stringify({ message: "Internal Server Error", error: errorMessage }), { status: 500 });
  }
}