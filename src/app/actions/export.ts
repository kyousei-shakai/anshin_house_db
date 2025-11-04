// src/app/actions/export.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { type ConsultationWithStaff } from '@/types/consultation'
import XlsxPopulate from 'xlsx-populate'
import path from 'path'
import fs from 'fs/promises'
import {
  formatConsultationRoute,
  formatConsulterInfo,
  formatWithPrefix,
} from '@/utils/consultation-formatter'
import { Database } from '@/types/database'

// xlsx-populateの型定義
type Workbook = Awaited<ReturnType<typeof XlsxPopulate.fromDataAsync>>
type Sheet = ReturnType<Workbook['sheet']>
type Cell = ReturnType<ReturnType<Workbook['sheet']>['cell']>
type Consultation = Database['public']['Tables']['consultations']['Row']


// ★★★ 月次報告書生成のServer Action（修正版） ★★★
export async function generateMonthlyReportExcel(year: number, month: number) {
  if (!year || !month || month < 1 || month > 12) {
    return { success: false, error: '無効な年月が指定されました。' };
  }

  const supabase = await createClient();

  try {
    // 1. 指定月の相談データを取得
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data: consultations, error: fetchError } = await supabase
      .from('consultations')
      .select('*')
      .gte('consultation_date', startDate)
      .lte('consultation_date', endDate)
      .order('consultation_date', { ascending: true });

    if (fetchError) throw fetchError;
    if (!consultations || consultations.length === 0) {
      return { success: false, error: '指定された期間に該当する相談データがありません。' };
    }

    // 2. テンプレートファイルの存在確認と読み込み
    // Vercel環境対応: process.cwd() + public/ から読み込み
    const templatePath = path.join(process.cwd(), 'public', 'monthly_report_template.xlsx');

    try {
      await fs.access(templatePath);
    } catch {
      return {
        success: false,
        error: 'テンプレートファイル (monthly_report_template.xlsx) が見つかりません。'
      };
    }

    const workbook = await XlsxPopulate.fromFileAsync(templatePath);

    // 3. シートの安全な取得
    const sheetName = "月次報告書テンプレート";
    const sheet = workbook.sheet(sheetName);

    if (!sheet) {
      const availableSheets = workbook.sheets().map((s: Sheet) => s.name()).join(', ');
      throw new Error(
        `シート "${sheetName}" が見つかりません。利用可能なシート: ${availableSheets}`
      );
    }

    // 4. 年月プレースホルダーを置換（nullチェック付き）
    const cellA4Value = sheet.cell("A4").value();
    if (cellA4Value) {
      sheet.cell("A4").value(
        String(cellA4Value)
          .replace('{{YEAR}}', String(year))
          .replace('{{MONTH}}', String(month))
      );
    }

    // 5. テンプレート行の定義
    const TEMPLATE_ROW_NUMBER = 6;
    const templateRow = sheet.row(TEMPLATE_ROW_NUMBER);

    // スタイルプロパティのリスト（主要なものを抽出）
    const styleProperties = [
      'bold', 'italic', 'underline', 'fontSize', 'fontFamily', 'fontColor',
      'horizontalAlignment', 'verticalAlignment', 'wrapText',
      'border', 'borderColor', 'borderStyle', 'fill'
    ];

    // 6. 各相談データを行に書き込む
    consultations.forEach((consultation, index) => {
      // 1件目はテンプレート行（6行目）を上書き、2件目以降は7, 8, 9...行
      const currentRowNumber = TEMPLATE_ROW_NUMBER + index;
      const currentRow = sheet.row(currentRowNumber);

      // 2件目以降の行に対して、テンプレート行からスタイルをコピー
      if (index > 0) {
        // テンプレート行の各セルからスタイルをコピー
        for (let colIdx = 1; colIdx <= 3; colIdx++) { // A, B, C列
          const templateCell = templateRow.cell(colIdx);
          const currentCell = currentRow.cell(colIdx);

          // 主要なスタイルプロパティを一括取得
          const styles = templateCell.style(styleProperties);

          // 取得したスタイルを新しいセルに設定
          currentCell.style(styles);
        }
      }

      // 7. セルにデータを書き込む
      // A列: No.
      currentRow.cell(1).value(index + 1);

      // C列: 相談日（Date型に変換して渡す）
      try {
        const consultationDate = new Date(consultation.consultation_date);
        currentRow.cell(3).value(consultationDate);
      } catch {
        // Date変換に失敗した場合は文字列として設定
        currentRow.cell(3).value(consultation.consultation_date);
      }

      // B列: 結合された相談内容
      const line1 = `${formatConsultationRoute(consultation)}　${formatConsulterInfo(consultation)}`;
      const line2 = formatWithPrefix(consultation.relocation_reason, '引越理由');
      const line3 = formatWithPrefix(consultation.consultation_content, '状況・相談内容');
      const line4 = formatWithPrefix(consultation.consultation_result, '相談結果');

      const combinedText = [line1, line2, line3, line4].filter(Boolean).join('\n');

      currentRow.cell(2).value(combinedText);
    });

    // 8. Excelファイルとして出力
    const buffer = await workbook.outputAsync();
    const fileBuffer = Buffer.from(buffer).toString('base64');

    return { success: true, fileBuffer };

  } catch (error) {
    console.error("generateMonthlyReportExcel Error:", error);
    const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました";
    return { success: false, error: errorMessage, fileBuffer: null };
  }
}
// ★★★ 月次報告書生成のServer Action ここまで ★★★


// --- 以下、既存のヘルパー関数群と generateFormattedConsultationsExcel はそのまま ---

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

const getRelocationAdminOpinionLabel = (opinion: string | null | undefined, details: string | null | undefined): string => {
    if (!opinion) return '未設定';
    const detailText = details ? ` (${details})` : '';
    switch (opinion) {
      case 'possible': return '可';
      case 'impossible': return '否';
      case 'pending': return '確認中';
      case 'other': return `その他${detailText}`;
      default: return opinion;
    }
};

const getRelocationCostBearerLabel = (bearer: string | null | undefined, details: string | null | undefined): string => {
    if (!bearer) return '未設定';
    const detailText = details ? ` (${details})` : '';
    switch (bearer) {
      case 'previous_city': return '転居前の市区町村が負担';
      case 'next_city': return '転居先の市区町村が負担';
      case 'self': return '利用者本人の負担';
      case 'pending': return '確認中';
      case 'other': return `その他${detailText}`;
      default: return bearer;
    }
};

const getRentArrearsDurationLabel = (duration: string | null | undefined, details: string | null | undefined): string => {
      if (!duration) return '未設定';
      const detailText = details ? ` (${details})` : '';
      switch (duration) {
          case '1_month': return '1ヶ月';
          case '2_to_3_months': return '2〜3ヶ月';
          case 'half_year_or_more': return '半年以上';
          case 'other': return `その他${detailText}`;
          default: return duration;
      }
};

const createReplacements = (consultation: ConsultationWithStaff): Record<string, string | number> => {
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
        '{{staff_name}}': consultation.staff?.name || '', 
        '{{route_self}}': check(consultation.consultation_route_self),
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
        '{{birth_era_name}}': japaneseEra ? japaneseEra.era : '西暦',
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

export async function generateFormattedConsultationsExcel(consultationIds: string[]) {
  if (!consultationIds || !Array.isArray(consultationIds)) {
    return { success: false, error: '無効なリクエストです。' };
  }

  const supabase = await createClient();

  try {
    const { data: allConsultations, error: fetchError } = await supabase
      .from('consultations')
      .select('*, staff:staff_id (name)') // staffのnameを取得
      .in('id', consultationIds);

    if (fetchError) throw fetchError;

    // Vercel環境対応: process.cwd() + public/ から読み込み
    const templatePath = path.join(process.cwd(), 'public', 'consultation_template.xlsx');
    const templateData = await fs.readFile(templatePath);
    const workbook: Workbook = await XlsxPopulate.fromDataAsync(templateData);
    const templateSheet = workbook.sheet("テンプレート");
    
    if (!templateSheet) {
      throw new Error("テンプレートシート 'テンプレート' が見つかりません。");
    }

    if (allConsultations && allConsultations.length > 0) {
      for (const [index, consultation] of allConsultations.entries()) {
          const newSheetName = sanitizeSheetName(consultation.name || `無名_${index + 1}`);
          let finalSheetName = newSheetName;
          let count = 2;
          while(workbook.sheet(finalSheetName)) {
              finalSheetName = `${newSheetName.substring(0, 31 - `(${count})`.length)}(${count})`;
              count++;
          }
          
          workbook.cloneSheet(templateSheet, finalSheetName);
          const newSheet = workbook.sheet(finalSheetName);

          const replacements = createReplacements(consultation as unknown as ConsultationWithStaff);

          const usedRange = newSheet.usedRange();
          if (usedRange) {
              usedRange.forEach((cell: Cell) => {
                  const cellValue = cell.value();
                  
                  if (typeof cellValue === 'string') {
                      let modifiedValue = cellValue;
                      for (const key in replacements) {
                          const placeholder = new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                          if (placeholder.test(modifiedValue)) {
                              const replacementValue = (replacements as Record<string, string | number>)[key];
                              modifiedValue = modifiedValue.replace(placeholder, String(replacementValue));
                          }
                      }
                      if (modifiedValue !== cellValue) {
                          cell.value(modifiedValue);
                      }
                  }
              });
          }
      }
      
      if (workbook.sheets().length > 1) {
        templateSheet.delete();
      }
    } else {
        templateSheet.name("データなし");
    }

    const buffer = await workbook.outputAsync();
    const fileBuffer = Buffer.from(buffer).toString('base64');

    return { success: true, fileBuffer };

  } catch (error) {
    console.error("generateFormattedConsultationsExcel Error:", error);
    const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました";
    return { success: false, error: errorMessage, fileBuffer: null };
  }
}