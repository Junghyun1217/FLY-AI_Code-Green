import json
from jinja2 import Environment, FileSystemLoader
import os

# --- 설정 값 ---
# 1. HTML 템플릿 파일이 있는 폴더 경로
template_folder = 'template'
template_filename = 'HI_REPORT_TEMPLATE.html'

# 2. 백엔드에서 받은 JSON 데이터 파일 경로
json_file_path = 'result/result(1).json' # 실제 사용하는 파일 이름으로 지정해주세요.

# 3. 결과물을 저장할 최종 HTML 파일 이름
output_filename = 'HIDDEN_IMPACT_REPORT.html'

# --- 하드코딩된 SDG 데이터 ---
# 부록과 스코어카드 라벨 이름은 이 고정 데이터를 사용합니다.
sdgs_hardcoded_data = [
    { "name": "SDG 1 | 빈곤 종식", "description": "모든 곳에서 모든 형태의 빈곤 종식" },
    { "name": "SDG 2 | 기아 해소", "description": "기아 종식, 식량 안보와 영양 개선 달성 및 지속가능한 농업 강화" },
    { "name": "SDG 3 | 건강과 웰빙", "description": "모든 연령층의 건강한 삶 보장 및 웰빙 증진" },
    { "name": "SDG 4 | 양질의 교육", "description": "모두를 위한 포용적이고 공평한 양질의 교육 보장 및 평생학습 기회 증진" },
    { "name": "SDG 5 | 성 평등", "description": "성 평등 달성 및 모든 여성과 여아의 권익 신장" },
    { "name": "SDG 6 | 깨끗한 물과 위생", "description": "모두를 위한 물과 위생의 이용가능성 및 지속가능한 관리 보장" },
    { "name": "SDG 7 | 모두를 위한 깨끗한 에너지", "description": "모두에게 저렴하고 신뢰성 있으며 지속가능하고 현대적인 에너지에 대한 접근 보장" },
    { "name": "SDG 8 | 양질의 일자리와 경제성장", "description": "포용적이고 지속가능한 경제성장, 완전하고 생산적인 고용과 모두를 위한 양질의 일자리 증진" },
    { "name": "SDG 9 | 산업, 혁신, 사회기반시설", "description": "회복력 있는 사회기반시설 구축, 포용적이고 지속가능한 산업화 증진, 혁신 촉진" },
    { "name": "SDG 10 | 불평등 감소", "description": "국내 및 국가 간 불평등 감소" },
    { "name": "SDG 11 | 지속가능한 도시와 공동체", "description": "포용적이고 안전하며 회복력 있고 지속가능한 도시와 주거지 조성" },
    { "name": "SDG 12 | 책임감 있는 소비와 생산", "description": "지속가능한 소비 및 생산 양식 보장" },
    { "name": "SDG 13 | 기후변화 대응", "description": "기후변화와 그 영향에 대처하기 위한 긴급 조치 시행" },
    { "name": "SDG 14 | 해양 생태계 보전", "description": "지속가능발전을 위한 대양, 바다, 해양자원 보존 및 지속가능한 사용" },
    { "name": "SDG 15 | 육상 생태계 보전", "description": "육상 생태계 보호, 복원 및 증진, 산림의 지속가능한 관리, 사막화 방지, 토지 황폐화 중단 및 복구, 생물다양성 손실 중단" },
    { "name": "SDG 16 | 평화, 정의, 강력한 제도", "description": "지속가능발전을 위한 평화롭고 포용적인 사회 증진, 모두에게 정의에 대한 접근 제공 및 모든 수준에서 효과적이고 책임감 있으며 포용적인 제도 구축" },
    { "name": "SDG 17 | 지구촌 협력", "description": "이행수단 강화 및 지속가능발전을 위한 글로벌 파트너십 활성화" }
]

# --- 메인 실행 코드 ---
try:
    # 1. Jinja2 템플릿 환경 설정
    env = Environment(loader=FileSystemLoader(template_folder))
    template = env.get_template(template_filename)
    print(f"✅ HTML 템플릿 ('{template_filename}') 로딩 성공.")

    # 2. JSON 데이터 불러오기
    print(f"'{json_file_path}' 파일 로딩 중...")
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print("✅ JSON 데이터 로딩 완료.")

    # 3. 템플릿에 전달할 데이터 가공하기
    print("템플릿에 맞게 데이터 가공 중...")
    
    # JSON의 scorecard에서 점수만 추출하여 맵으로 생성
    score_map = {item['sdg']: item['net_alignment_score'] for item in data.get('scorecard', [])}
    
    # 하드코딩된 데이터에 동적 점수를 합쳐 최종 리스트 생성
    scorecard_full = []
    for i, sdg_info in enumerate(sdgs_hardcoded_data):
        sdg_key = f"SDG {i + 1}"
        score = score_map.get(sdg_key, 0.0)
        scorecard_full.append({
            'name': sdg_info['name'],
            'description': sdg_info['description'],
            'score': score
        })
    
    # 가공된 데이터를 원래 데이터 딕셔너리에 추가
    data['scorecard_full'] = scorecard_full
    
    print("✅ 데이터 가공 완료.")

    # 4. 템플릿에 데이터 채우기 (렌더링)
    print("HTML 템플릿에 데이터 적용 중...")
    # data 딕셔너리의 모든 키-값을 템플릿 변수로 전달
    rendered_html = template.render(**data)
    print("✅ HTML 렌더링 완료.")

    # 5. 완성된 HTML을 파일로 저장
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(rendered_html)
    
    print("-" * 30)
    print(f"🎉 성공! '{os.path.abspath(output_filename)}' 파일이 생성되었습니다.")
    print("이 파일을 웹 브라우저에서 열어 보고서를 확인하세요.")
    print("-" * 30)

except FileNotFoundError as e:
    print(f"❌ 오류: 파일을 찾을 수 없습니다. 경로를 확인해주세요.")
    print(f"    - 확인 필요한 파일: {e.filename}")
    print(f"    - 템플릿 폴더 경로: '{os.path.abspath(template_folder)}'")
    print(f"    - JSON 파일 경로: '{os.path.abspath(json_file_path)}'")
except Exception as e:
    print(f"❌ 알 수 없는 오류가 발생했습니다: {e}")
