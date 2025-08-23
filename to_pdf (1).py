import json
from jinja2 import Environment, FileSystemLoader
import os
import re

# --- 설정 값 ---
# 1. 템플릿 파일이 있는 폴더 경로를 지정합니다.
#    (백슬래시'\'를 슬래시'/'로 바꾸거나, 앞에 r을 붙여 r'c:\...'로 써주세요)
template_folder = 'template'  

# 2. JSON 파일 경로를 지정합니다. 
#    (이 스크립트가 있는 폴더 기준 'result' 폴더 안의 'result.json')
json_file_path = 'result/result(1).json'

# 3. 결과물을 저장할 파일 이름을 지정합니다.
output_filename = 'IMPACT_REPORT.html'

# --- 메인 코드 ---
try:
    # Jinja2 환경 설정
    env = Environment(loader=FileSystemLoader(template_folder))
    template = env.get_template('AI_REPORT_TEMPLATE.html')

    # --- 추가된 부분 ---
    print("✅ HTML 템플릿 로딩 성공.")
    
    # JSON 데이터 불러오기
    print(f"'{json_file_path}' 파일 로딩 중...")
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
   
    print(data)

    if 'impact_kpis' in data and data['impact_kpis']:
        print("KPI 이름에서 괄호 안 설명 제거 중...")
        for kpi in data['impact_kpis']:
            # kpi['name']이 문자열일 때만 처리
            if isinstance(kpi.get('name'), str):
                # 정규표현식을 사용해 괄호와 그 안의 내용을 모두 제거
                kpi['name'] = re.sub(r'\(.*\)', '', kpi['name']).strip()


    # (이전 코드) sdgs_main이 문자열일 경우를 대비한 처리
    if isinstance(data.get("sdgs_main"), str):
        data["sdgs_main"] = json.loads(data["sdgs_main"])

    # 템플릿에 데이터 넣어서 HTML 렌더링
    print("HTML 템플릿에 데이터 적용 중...")
    # data 딕셔너리의 모든 키-값을 템플릿 변수로 넘겨줍니다.
    # 템플릿에서는 {{ company_summary }} 처럼 키 이름을 바로 사용합니다.

    ############ 아래

    rendered_html = template.render(data)
    print("HTML 렌더링 완료.")

    # 완성된 HTML을 파일로 저장
    # 스크립트가 있는 폴더에 결과물을 저장합니다.
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(rendered_html)
    
    print("-" * 30)
    print(f"✅ 성공! '{os.path.abspath(output_filename)}' 파일이 생성되었습니다.")
    print("-" * 30)

except FileNotFoundError:
    print(f"❌ 오류: 파일을 찾을 수 없습니다. 경로를 확인해주세요.")
    print(f"템플릿 폴더: '{template_folder}'")
    print(f"JSON 파일: '{json_file_path}'")
except Exception as e:
    print(f"❌ 오류가 발생했습니다: {e}")






# import json
# from jinja2 import Environment, FileSystemLoader
# from weasyprint import HTML

# # JSON 로드
# with open('result/result.json', 'r', encoding='utf-8') as f:
#     data = json.load(f)

# if isinstance(data.get("sdgs_main"), str):
#     data["sdgs_main"] = json.loads(data["sdgs_main"])

# if isinstance(data.get("sdgs_sub"), str):
#     data["sdgs_sub"] = json.loads(data["sdgs_sub"])

# # Jinja2 환경 설정
# env = Environment(loader=FileSystemLoader('.'))
# template = env.get_template('template.html')

# # 데이터 바인딩
# html_out = template.render(data=data)

# # # PDF 변환 - weasyprint 사용
# # HTML(string=html_out).write_pdf('airkitchen_esg_report.pdf')

# import json
# from jinja2 import Environment, FileSystemLoader
# from weasyprint import HTML # ◀◀ 1. weasyprint 라이브러리 추가
# import os

# # --- 설정 값 ---
# template_folder = 'c:/ws/impact_report2'
# json_file_path = 'result/result.json'
# output_html_filename = 'report_final.html'
# output_pdf_filename = 'esg_report.pdf' # PDF 파일 이름 설정

# # --- 메인 코드 ---
# try:
#     # Jinja2 환경 설정
#     env = Environment(loader=FileSystemLoader(template_folder))
#     template = env.get_template('impact_report2.html')

#     # JSON 데이터 불러오기
#     print(f"'{json_file_path}' 파일 로딩 중...")
#     with open(json_file_path, 'r', encoding='utf-8') as f:
#         data = json.load(f)
#     print("JSON 로딩 완료.")

#     # sdgs_main이 문자열일 경우를 대비한 처리
#     if isinstance(data.get("sdgs_main"), str):
#         data["sdgs_main"] = json.loads(data["sdgs_main"])

#     # 템플릿에 데이터 넣어서 HTML 렌더링
#     print("HTML 템플릿에 데이터 적용 중...")
#     rendered_html = template.render(data)
#     print("HTML 렌더링 완료.")

#     # 완성된 HTML을 파일로 저장
#     with open(output_html_filename, 'w', encoding='utf-8') as f:
#         f.write(rendered_html)
#     print(f"✅ 성공! '{os.path.abspath(output_html_filename)}' HTML 파일이 생성되었습니다.")
    
#     # # ◀◀ 2. 렌더링된 HTML을 사용해 PDF 파일로 변환 및 저장
#     # print("PDF 파일 변환 중... (시간이 조금 걸릴 수 있습니다)")
#     # HTML(string=rendered_html).write_pdf(output_pdf_filename)
#     # print(f"✅ 성공! '{os.path.abspath(output_pdf_filename)}' PDF 파일이 생성되었습니다.")
#     # print("-" * 30)

# except Exception as e:
#     print(f"❌ 오류가 발생했습니다: {e}")

# import json
# from jinja2 import Environment, FileSystemLoader

# # --- 설정 값 ---
# # 1. 템플릿 파일이 들어있는 폴더 경로
# template_folder = 'c:/ws/impact_report2' 

# # 2. 데이터가 들어있는 JSON 파일 경로
# json_file_path = 'result/result.json'

# # 3. 최종 결과물을 저장할 HTML 파일 이름
# output_html_filename = 'report_final.html'


# # --- 로직 ---
# # HTML 템플릿 파일의 이름을 'template.html'로 가정합니다.
# # 만약 다른 이름이라면 이 부분을 수정해주세요. (예: 'report_template.html')
# template_file = 'impact_report2.html'

# # 1. JSON 파일에서 데이터 읽기
# try:
#     with open(json_file_path, 'r', encoding='utf-8') as f:
#         data = json.load(f)
#     print("✅ JSON 데이터 로딩 성공!")
# except FileNotFoundError:
#     print(f"❌ 오류: '{json_file_path}' 파일을 찾을 수 없습니다.")
#     exit()
# except json.JSONDecodeError:
#     print(f"❌ 오류: '{json_file_path}' 파일이 올바른 JSON 형식이 아닙니다.")
#     exit()

# # 2. Jinja2 템플릿 환경 설정
# # FileSystemLoader는 템플릿 파일을 어디서 찾을지 알려줍니다.
# env = Environment(loader=FileSystemLoader(template_folder))
# template = env.get_template(template_file)
# print(f"✅ HTML 템플릿('{template_file}') 로딩 성공!")

# # 3. 템플릿에 데이터 적용(렌더링)
# # JSON 파일의 모든 데이터가 'data'라는 이름으로 템플릿에 전달됩니다.
# output_html = template.render(data=data)
# print("✅ 템플릿에 데이터 적용 완료!")

# # 4. 결과물을 HTML 파일로 저장
# with open(output_html_filename, 'w', encoding='utf-8') as f:
#     f.write(output_html)

# print(f"\n🎉 성공! '{output_html_filename}' 파일이 생성되었습니다.")