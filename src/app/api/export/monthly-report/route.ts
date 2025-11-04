// src/app/api/export/monthly-report/route.ts
import { createClient } from '@/utils/supabase/server'
import XlsxPopulate from 'xlsx-populate'
import path from 'path'
import fs from 'fs/promises'
import { NextResponse } from 'next/server'
import {
  formatConsultationRoute,
  formatConsulterInfo,
  formatWithPrefix,
} from '@/utils/consultation-formatter'
import { Database } from '@/types/database'

// xlsx-populateの型定義
type Workbook = Awaited<ReturnType<typeof XlsxPopulate.fromFileAsync>>
type Sheet = ReturnType<Workbook['sheet']>
type Consultation = Database['public']['Tables']['consultations']['Row']

export async function POST(request: Request) {
  try {
    const { year, month } = await request.json();

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json({ error: '無効な年月が指定されました。' }, { status: 400 });
    }

    const supabase = await createClient();

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
      return NextResponse.json({ error: '指定された期間に該当する相談データがありません。' }, { status: 404 });
    }

    // 2. テンプレートファイルの存在確認と読み込み
    // Vercel環境対応: process.cwd() + public/ から読み込み
    const templatePath = path.join(process.cwd(), 'public', 'monthly_report_template.xlsx');

    try {
      await fs.access(templatePath);
    } catch {
      return NextResponse.json({
        error: 'テンプレートファイル (monthly_report_template.xlsx) が見つかりません。'
      }, { status: 500 });
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

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=monthly_report_${year}_${String(month).padStart(2, '0')}.xlsx`
      }
    });

  } catch (error) {
    console.error("API Route Error:", error);
    const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
