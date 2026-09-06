const MIT_LA = 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/';
const MIT_PROB = 'https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/';
const NUMPY_DOT = 'https://numpy.org/doc/stable/reference/generated/numpy.linalg.vecdot.html';
const NUMPY_NORM = 'https://numpy.org/doc/stable/reference/generated/numpy.linalg.norm.html';
const MEDIAPIPE = 'https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js';
const PYTORCH = 'https://docs.pytorch.org/tutorials/beginner/basics/';
const SKLEARN = 'https://scikit-learn.org/stable/common_pitfalls.html';
const PYODIDE = 'https://pyodide.org/en/latest/usage/webworker.html';
const PUBMED_DISTANCE = 'https://pubmed.ncbi.nlm.nih.gov/38314525/';
const PUBMED_POSITION = 'https://pubmed.ncbi.nlm.nih.gov/8809716/';
const FORMPATH = 'https://github.com/Rudwpahs/shooting-profile-coach-ios/blob/main/';

const q = (id, prompt, options, correct, explanation) => ({ id, prompt, options, correct, explanation });
const source = (title, publisher, url, sourceType = 'documentation') => ({ title, publisher, url, sourceType });

export const modules = [
  {
    id: 'm1', slug: 'coordinate-systems-vectors', title: 'Coordinate systems and vectors', estimatedMinutes: 30,
    summary: '좌표계, 점, 벡터, 방향과 크기를 구분하고 슈팅 관절 좌표를 숫자로 표현하는 출발점.',
    prerequisites: [],
    objectives: ['점과 벡터의 차이를 설명한다.', '두 점 사이 변위 벡터와 벡터 크기를 계산한다.', '카메라 좌표와 해부학적 의미를 혼동하지 않는다.'],
    concepts: [
      { heading: '좌표는 위치, 벡터는 변화', body: '점 P=(x,y)는 한 프레임 안의 위치를 나타낸다. 벡터 v=B-A는 A에서 B로 가는 방향과 거리를 함께 담는다. FormPath에서 어깨→팔꿈치, 팔꿈치→손목 같은 벡터가 관절각 계산의 재료가 된다.', formula: 'v = B − A,   ‖v‖ = √(vx² + vy²)' },
      { heading: '좌표계는 약속이다', body: '영상 좌표는 보통 화면 오른쪽이 +x, 아래쪽이 +y다. 수학 교과서의 +y 위쪽과 다를 수 있다. 좌우 반전, 회전, 정규화 여부까지 좌표계 정의에 포함된다.' },
      { heading: '숫자는 몸 자체가 아니다', body: 'landmark 좌표는 관측값이다. 가림, 카메라 시점, 탐지 오차 때문에 실제 관절 중심과 다를 수 있으므로 “좌표를 얻었다 = 실제 3D 위치를 안다”가 아니다.' },
    ],
    sources: [source('Linear Algebra', 'MIT OpenCourseWare · Gilbert Strang', MIT_LA, 'course'), source('numpy.linalg.norm', 'NumPy', NUMPY_NORM)],
    lab: { id: 'l1', title: '두 관절점에서 변위와 길이 계산', packages: [], starterCode: `import math\nshoulder = (0.32, 0.41)\nelbow = (0.47, 0.58)\nv = (elbow[0]-shoulder[0], elbow[1]-shoulder[1])\nlength = math.hypot(*v)\nprint("vector =", tuple(round(x, 3) for x in v))\nprint("length =", round(length, 4))`, expectedOutput: 'vector = (0.15, 0.17)\nlength ≈ 0.2267', explanation: '정규화 영상 좌표에서 어깨→팔꿈치 변위와 길이를 계산한다.' },
    quiz: { id: 'q1', questions: [
      q('q1a','점 A=(1,2), B=(4,6)일 때 A→B 벡터는?',['(3,4)','(5,8)','(-3,-4)','(4,6)'],'(3,4)','B-A를 계산한다.'),
      q('q1b','벡터 (3,4)의 크기는?',['5','7','12','25'],'5','피타고라스 정리로 √(9+16)=5.'),
      q('q1c','영상 좌표의 +y가 흔히 향하는 방향은?',['아래','위','항상 왼쪽','정해져 있지 않음'],'아래','브라우저/이미지 좌표는 보통 화면 아래가 +y다.'),
      q('q1d','landmark 좌표를 실제 관절 중심과 완전히 같다고 보면 안 되는 이유는?',['관측 오차와 가림','벡터가 없어서','정수만 써서','프레임이 없어서'],'관측 오차와 가림','landmark는 모델의 관측 추정값이다.'),
      q('q1e','두 관절 사이 방향을 얻는 첫 연산은?',['두 점의 차','두 점의 합','좌표 정렬','확률 곱'],'두 점의 차','끝점-시작점이 변위 벡터다.'),
    ]},
    formPathConnection: { label: '좌표·벡터가 실제 파이프라인에 들어가는 곳', path: 'lib/shooting-profile/two-view-pipeline.ts', explanation: '두 시점 landmark sequence가 후속 정렬·대표 시퀀스 구성으로 넘어가는 경계를 읽는다.', evidenceClass: 'implementation' },
  },
  {
    id: 'm2', slug: 'dot-products-angles', title: 'Dot products, magnitudes, and angles', estimatedMinutes: 35,
    summary: '내적을 이용해 두 벡터 사이 각도를 계산하고 수치 안정성까지 이해한다.', prerequisites: ['m1'],
    objectives: ['내적의 기하학적 의미를 설명한다.', 'acos 입력을 [-1,1]로 제한해야 하는 이유를 안다.', '2D·3D에서 같은 각도 공식을 적용한다.'],
    concepts: [
      { heading: '내적은 방향의 닮음 정도', body: 'a·b = ‖a‖‖b‖cosθ. 같은 방향이면 양수 최대, 직각이면 0, 반대면 음수다. 관절각은 관절을 꼭짓점으로 두 벡터를 만든 뒤 이 공식을 적용한다.', formula: 'θ = acos((a·b)/(‖a‖‖b‖))' },
      { heading: '0벡터와 clamp', body: '관절 두 점이 겹쳐 벡터 크기가 0이면 각도는 정의되지 않는다. 부동소수점 오차로 cos 값이 1.00000001처럼 나올 수 있어 acos 전 [-1,1]로 clamp한다.' },
    ],
    sources: [source('Linear Algebra', 'MIT OpenCourseWare · Gilbert Strang', MIT_LA, 'course'), source('numpy.linalg.vecdot', 'NumPy', NUMPY_DOT)],
    lab: { id: 'l2', title: 'NumPy 내적으로 각도 구하기', packages: ['numpy'], starterCode: `import math\nimport numpy as np\na=np.array([1.0,0.0])\nb=np.array([1.0,1.0])\nc=float(np.dot(a,b)/(np.linalg.norm(a)*np.linalg.norm(b)))\nc=max(-1.0,min(1.0,c))\nprint(round(math.degrees(math.acos(c)),2))`, expectedOutput: '45.0', explanation: '두 벡터의 내적과 크기로 45°를 복원한다.' },
    quiz: { id: 'q2', questions: [
      q('q2a','서로 직각인 두 벡터의 내적은?',['0','1','-1','무한대'],'0','cos90°=0.'),
      q('q2b','acos 전에 값을 clamp하는 주된 이유는?',['부동소수점 오차','속도 증가','좌표 반전','프레임 삭제'],'부동소수점 오차','정상 계산도 미세하게 정의역을 벗어날 수 있다.'),
      q('q2c','벡터 크기가 0이면 각도는?',['정의되지 않음','항상 0°','항상 90°','항상 180°'],'정의되지 않음','분모가 0이므로 방향 자체가 없다.'),
      q('q2d','같은 방향 단위벡터의 내적은?',['1','0','-1','2'],'1','cos0°=1.'),
      q('q2e','3D 벡터에도 같은 내적 각도 공식을 쓸 수 있나?',['예','아니오','x축에서만','정수일 때만'],'예','유클리드 내적 공식은 차원에 일반화된다.'),
    ]},
    formPathConnection: { label: '관절 방향/각도 계산의 수학적 기반', path: 'lib/shooting-profile/reconstruction.ts', explanation: '대표 3D 방향과 관절 관계를 다룰 때 내적·정규화의 안정성이 기본 전제다.', evidenceClass: 'math' },
  },
  {
    id: 'm3', slug: 'joint-angle-2d', title: '2D joint-angle calculation', estimatedMinutes: 40,
    summary: '어깨–팔꿈치–손목처럼 세 landmark로 2D 관절각을 계산하고 시점 의존성을 구분한다.', prerequisites: ['m1','m2'],
    objectives: ['세 점으로 관절각을 계산한다.', '관절각의 꼭짓점이 중간 점이라는 것을 안다.', '2D 투영각과 실제 3D 관절각을 구분한다.'],
    concepts: [
      { heading: '세 점, 두 벡터', body: '팔꿈치 각도라면 E를 꼭짓점으로 E→S와 E→W 벡터를 만든다. 두 벡터 사이 각도가 영상 평면에서 본 팔꿈치 각도다.', formula: 'u=S−E, v=W−E, θ=acos((u·v)/(‖u‖‖v‖))' },
      { heading: '2D 각도는 투영 결과', body: '카메라를 정면에서 보느냐 옆에서 보느냐에 따라 동일한 3D 자세가 다른 2D 각도로 보인다. 따라서 단일 영상의 2D 각도를 곧바로 실제 공간 관절각이라고 부르면 안 된다.' },
      { heading: '신뢰도와 결측', body: '한 점의 confidence가 낮으면 세 점으로 만든 각도도 약해진다. 결측을 0 좌표로 채우기보다 계산을 거부하거나 uncertainty를 높이는 편이 안전하다.' },
    ],
    sources: [source('Pose landmark detection guide for Web', 'Google AI Edge · MediaPipe', MEDIAPIPE), source('Linear Algebra', 'MIT OpenCourseWare', MIT_LA, 'course')],
    lab: { id: 'l3', title: '팔꿈치 2D 각도 함수', packages: [], starterCode: `import math\ndef angle(a,b,c):\n    u=(a[0]-b[0], a[1]-b[1]); v=(c[0]-b[0], c[1]-b[1])\n    nu=math.hypot(*u); nv=math.hypot(*v)\n    if nu==0 or nv==0: return None\n    cosv=max(-1,min(1,(u[0]*v[0]+u[1]*v[1])/(nu*nv)))\n    return math.degrees(math.acos(cosv))\nprint(round(angle((0,1),(0,0),(1,0)),1))`, expectedOutput: '90.0', explanation: '중간 점을 꼭짓점으로 두 벡터를 만들고 각도를 계산한다.' },
    quiz: { id: 'q3', questions: [
      q('q3a','S-E-W로 팔꿈치 각을 구할 때 꼭짓점은?',['E','S','W','카메라'],'E','관절 중심인 팔꿈치가 꼭짓점이다.'),
      q('q3b','단일 카메라 2D 각도의 가장 큰 한계는?',['시점 의존성','소수점 사용','프레임 수','색상'],'시점 의존성','깊이 방향 성분이 투영된다.'),
      q('q3c','landmark confidence가 매우 낮다면?',['각도를 무조건 믿지 않는다','0으로 바꾼다','항상 90°로 둔다','색을 바꾼다'],'각도를 무조건 믿지 않는다','입력 신뢰도가 낮으면 파생값도 취약하다.'),
      q('q3d','2D 투영각을 ground-truth 3D 각이라고 불러도 되나?',['아니오','예','정면이면 항상 예','선수면 예'],'아니오','투영은 깊이 정보를 잃는다.'),
      q('q3e','세 점 중 두 점이 같아 0벡터가 생기면?',['각도 계산 거부','0° 저장','180° 저장','평균 사용'],'각도 계산 거부','방향이 정의되지 않는다.'),
    ]},
    formPathConnection: { label: '2D landmark에서 파생 측정치를 만들 때의 경계', path: 'modules/formpath-pose/ios/FormpathPoseModule.swift', explanation: '온디바이스 pose landmark 추출은 후속 분석의 관측 입력이다. 2D 관측과 제품 3D 추정의 데이터 등급을 분리한다.', evidenceClass: 'implementation' },
  },
  {
    id: 'm4', slug: 'video-frames-sampling-time', title: 'Digital video, frames, sampling, and time', estimatedMinutes: 30,
    summary: 'FPS, 프레임 간격, 샘플링과 시간축을 이해해 슛의 사건 순서를 읽는다.', prerequisites: ['m1'],
    objectives: ['FPS를 프레임 간 시간으로 변환한다.', '샘플링 해상도와 사건 시점 오차를 연결한다.', '서로 다른 촬영의 프레임 번호를 직접 동기시각으로 취급하지 않는다.'],
    concepts: [
      { heading: '프레임은 시간의 샘플', body: '60 fps는 약 16.67 ms마다 한 장을 관측한다. 빠른 릴리즈 사건은 프레임 사이에서 일어날 수 있어 사건 시점은 샘플링 해상도보다 정밀하다고 가정할 수 없다.', formula: 'Δt = 1 / fps' },
      { heading: '프레임 번호 ≠ 공통 시계', body: '따로 찍은 정면/측면 영상의 frame 120이 같은 실제 순간이라는 보장은 없다. FormPath는 이를 공통 물리 시간 동기화가 아니라 shot phase 정렬 문제로 다룬다.' },
    ],
    sources: [source('Pose Landmarker video mode', 'Google AI Edge · MediaPipe', MEDIAPIPE)],
    lab: { id: 'l4', title: 'FPS와 시간 해상도', packages: [], starterCode: `for fps in (30,60,120,240):\n    print(f"{fps} fps -> {1000/fps:.2f} ms/frame")`, expectedOutput: '30→33.33ms, 60→16.67ms, 120→8.33ms, 240→4.17ms', explanation: '샘플링 속도가 사건 시점 해상도를 제한한다.' },
    quiz: { id: 'q4', questions: [
      q('q4a','60 fps의 프레임 간격은 대략?',['16.7 ms','60 ms','6 ms','1 ms'],'16.7 ms','1000/60.'),
      q('q4b','따로 찍은 두 영상의 같은 프레임 번호는 같은 실제 시각인가?',['보장되지 않음','항상 같음','30fps에서만 같음','아이폰이면 같음'],'보장되지 않음','공통 시계 동기화가 없기 때문이다.'),
      q('q4c','fps가 높아지면 일반적으로?',['시간 샘플링이 촘촘해진다','깊이가 생긴다','오차가 0이 된다','3D가 된다'],'시간 샘플링이 촘촘해진다','프레임 간격이 줄어든다.'),
      q('q4d','프레임 사이에서 사건이 발생할 수 있나?',['예','아니오','120fps 이상만','정지영상만'],'예','연속 사건을 이산 샘플로 관측한다.'),
      q('q4e','FormPath의 비동시 두 영상은 무엇으로 맞추나?',['shot phase','동일 프레임 번호','GPS','오디오 주파수'],'shot phase','공통 실제 시각 대신 슛 진행 단계로 정렬한다.'),
    ]},
    formPathConnection: { label: '프레임 시각을 슛 진행 단계로 바꾸는 전제', path: 'lib/shooting-profile/cross-view-alignment.ts', explanation: '비동시 촬영을 직접 동기화하지 않고 검출된 shot phase의 호환성을 평가한다.', evidenceClass: 'implementation' },
  },
  {
    id: 'm5', slug: 'pose-landmarks-confidence', title: 'Pose landmarks and landmark confidence', estimatedMinutes: 35,
    summary: 'pose landmark의 좌표·visibility/confidence를 관측치로 읽고 품질 게이트를 이해한다.', prerequisites: ['m3','m4'],
    objectives: ['landmark와 실제 해부학적 관절 중심을 구분한다.', 'visibility/confidence를 품질 신호로 사용한다.', '가림과 화면 밖 관절이 파생량에 미치는 영향을 설명한다.'],
    concepts: [
      { heading: 'Pose model의 출력', body: 'MediaPipe Pose Landmarker는 신체 keypoint의 normalized image coordinates와 visibility 같은 정보를 제공한다. 이는 모델이 추정한 관측 결과이지 모션캡처 marker의 ground truth가 아니다.' },
      { heading: 'confidence는 정답 확률 그 자체가 아니다', body: 'confidence/visibility는 품질 판단에 유용하지만 각도 오차를 직접 도 단위로 보장하는 값은 아니다. 제품에서는 threshold와 failure reason을 검증 데이터로 따로 정해야 한다.' },
    ],
    sources: [source('Pose landmark detection guide for Web', 'Google AI Edge · MediaPipe', MEDIAPIPE)],
    lab: { id: 'l5', title: '낮은 confidence 관측 필터', packages: [], starterCode: `landmarks=[("shoulder",0.96),("elbow",0.82),("wrist",0.31)]\nkept=[name for name,c in landmarks if c>=0.6]\nprint("usable:", kept)`, expectedOutput: "usable: ['shoulder', 'elbow']", explanation: 'threshold는 예시일 뿐 제품 검증 임계값이 아니다.' },
    quiz: { id: 'q5', questions: [
      q('q5a','pose landmark는 무엇인가?',['모델이 추정한 keypoint 관측','정확한 뼈 중심 ground truth','GPS 위치','공의 궤적만'],'모델이 추정한 keypoint 관측','모델 출력값이다.'),
      q('q5b','visibility가 낮으면?',['파생 각도 신뢰를 낮춰야 한다','항상 삭제해야 한다','3D가 더 정확하다','프레임을 복제한다'],'파생 각도 신뢰를 낮춰야 한다','입력 관측 품질이 낮다.'),
      q('q5c','confidence 0.8이 각도 ±0.8° 보장을 뜻하나?',['아니오','예','항상 8°','항상 80%'],'아니오','confidence와 물리 오차 단위는 다르다.'),
      q('q5d','가림은 pose 측정에 영향을 주나?',['예','아니오','공에만','2D에는 절대 없음'],'예','관측 가능한 신체 정보가 줄어든다.'),
      q('q5e','threshold는 어떻게 정해야 하나?',['검증 데이터로','감으로만','항상 0.5','선수 이름으로'],'검증 데이터로','task/관절/시점에 맞는 검증이 필요하다.'),
    ]},
    formPathConnection: { label: '온디바이스 pose extraction', path: 'modules/formpath-pose/ios/FormpathPoseModule.swift', explanation: '실제 앱은 iPhone에서 landmark sequence를 추출하고 후속 품질 게이트로 넘긴다.', evidenceClass: 'implementation' },
  },
  {
    id: 'm6', slug: 'two-projection-3d-direction', title: '3D direction reconstruction from two projections', estimatedMinutes: 45,
    summary: '정면·측면 방향 단서를 결합해 3D 방향 후보를 만들되 무엇을 증명하지 못하는지 명확히 한다.', prerequisites: ['m2','m5'],
    objectives: ['두 투영의 각도 정보로 방향 벡터를 구성하는 아이디어를 설명한다.', 'conditioning이 나쁜 경우를 이해한다.', '비동시 두 시점 추정을 calibrated triangulation과 구분한다.'],
    concepts: [
      { heading: '두 투영에서 방향 제약 결합', body: '정면에서 본 기울기와 측면에서 본 기울기를 같은 해부학적 방향에 대한 제약으로 결합할 수 있다. 간단한 좌표 약속에서는 u ∝ (tan α, 1, tan β) 같은 표현이 나온다.', formula: 'u ∝ (tan α, 1, tan β), then normalize u' },
      { heading: '핵심 truth boundary', body: 'FormPath의 non-simultaneous two-view reconstruction is NOT calibrated triangulation and NOT ground-truth 3D. 서로 다른 두 촬영을 shot phase로 맞춰 projection constraints를 결합하는 추정이다.' },
      { heading: '시점이 다르다는 증거가 필요하다', body: '같은 영상 재사용, 거의 같은 각도, mirror 관계라면 두 번째 시점이 새 깊이 정보를 주지 않는다. 그래서 cross-view geometry gate가 필요하다.' },
    ],
    sources: [source('Linear Algebra', 'MIT OpenCourseWare', MIT_LA, 'course'), source('FormPath two-view pipeline', 'Rudwpahs · GitHub', `${FORMPATH}lib/shooting-profile/two-view-pipeline.ts`, 'project-code')],
    lab: { id: 'l6', title: '두 투영 각도에서 방향 정규화', packages: [], starterCode: `import math\na=math.radians(30); b=math.radians(20)\nu=[math.tan(a),1.0,math.tan(b)]\nn=math.sqrt(sum(x*x for x in u))\nprint(tuple(round(x/n,4) for x in u))`, expectedOutput: '정규화된 3D 방향 후보 (약 0.477, 0.826, 0.301)', explanation: '방향 후보를 만드는 수학 실험이며 calibrated camera triangulation이 아니다.' },
    quiz: { id: 'q6', questions: [
      q('q6a','FormPath 비동시 두 시점 추정은 calibrated triangulation인가?',['아니오','예','항상','선수에 따라 예'],'아니오','공통 calibration/동기화 triangulation이 아니다.'),
      q('q6b','ground-truth 3D라고 부를 수 있나?',['아니오','예','정면이면 예','60fps면 예'],'아니오','projection-constrained estimate다.'),
      q('q6c','두 영상이 사실상 같은 시점이면?',['깊이 제약이 약하다','완벽한 3D','오차 0','FPS 두 배'],'깊이 제약이 약하다','독립 시점 정보가 거의 없다.'),
      q('q6d','tan 기반 벡터를 만든 뒤 보통 필요한 것은?',['정규화','JPEG 압축','로그인','색 보정'],'정규화','방향 비교에 단위벡터가 유용하다.'),
      q('q6e','같은 클립 relabel을 막는 이유는?',['가짜 두 시점 정보를 방지','저장공간만 절약','UI 색상','음성 품질'],'가짜 두 시점 정보를 방지','독립 projection이 아니기 때문이다.'),
    ]},
    formPathConnection: { label: 'Two-view representative pipeline', path: 'lib/shooting-profile/two-view-pipeline.ts', explanation: '현재 제품 경계는 calibrated triangulation이 아니라 representative phase-fused estimate로 분류된다.', evidenceClass: 'synthetic-validation' },
  },
  {
    id: 'm7', slug: 'shot-phase-cross-view-alignment', title: 'Shot-phase representation and cross-view alignment', estimatedMinutes: 40,
    summary: '절대 시간이 다른 슛을 공통 진행률/사건 기준으로 맞추고 불일치를 recapture 신호로 다룬다.', prerequisites: ['m4','m6'],
    objectives: ['shot phase의 목적을 설명한다.', '속도가 다른 두 take를 공통 phase에 재샘플링하는 이유를 안다.', 'phase mismatch를 품질 게이트로 이해한다.'],
    concepts: [
      { heading: '시간 대신 진행 단계', body: '별도 촬영은 시작 시점과 속도가 다르다. 준비→상승→릴리즈 같은 사건을 기준으로 0~1 phase를 만들면 서로 다른 길이의 take를 비교할 수 있다.' },
      { heading: '정렬 실패는 숫자를 억지로 만들 이유가 아니다', body: '앵커 사건이 불명확하거나 두 take의 phase 구조가 크게 다르면 fusion보다 recapture가 안전하다.' },
    ],
    sources: [source('FormPath cross-view alignment', 'Rudwpahs · GitHub', `${FORMPATH}lib/shooting-profile/cross-view-alignment.ts`, 'project-code')],
    lab: { id: 'l7', title: '다른 길이의 take를 phase로 재샘플링', packages: [], starterCode: `front=[0,10,20,30,40]\nside=[0,8,16,24,32,40,48]\nfor p in (0,.25,.5,.75,1):\n    fi=round(p*(len(front)-1)); si=round(p*(len(side)-1))\n    print(p, front[fi], side[si])`, expectedOutput: '동일 phase에서 각 take의 대응 샘플이 선택됨', explanation: '프레임 번호가 아니라 진행률로 대응시키는 직관 실험.' },
    quiz: { id: 'q7', questions: [
      q('q7a','shot phase가 해결하려는 핵심은?',['비동시 take의 진행 단계 정렬','카메라 calibration','GPU 속도','로그인'],'비동시 take의 진행 단계 정렬','공통 절대시간이 없기 때문이다.'),
      q('q7b','두 take 길이가 달라도 phase 비교가 가능한가?',['예','아니오','프레임 수 같아야만','4K에서만'],'예','정규화된 진행 단계로 재표현한다.'),
      q('q7c','phase 검출이 실패하면?',['recapture/실패 처리','무조건 fusion','0으로 채움','평균 FPS 사용'],'recapture/실패 처리','불확실한 정렬을 숨기지 않는다.'),
      q('q7d','phase=0.5는 무엇을 뜻하나?',['정의된 슛 진행축의 중간','실제 경기시간 절반','항상 릴리즈','프레임 50'],'정의된 슛 진행축의 중간','절대 시각이 아니라 정규화된 진행도다.'),
      q('q7e','phase 정렬이 calibration을 대신하나?',['아니오','예','항상','120fps에서만'],'아니오','시간/진행 정렬과 카메라 기하 calibration은 다른 문제다.'),
    ]},
    formPathConnection: { label: 'Cross-view phase gate', path: 'lib/shooting-profile/cross-view-alignment.ts', explanation: 'phase mismatch가 크면 typed recapture로 중단하고 불완전 정렬은 uncertainty에 반영한다.', evidenceClass: 'implementation' },
  },
  {
    id: 'm8', slug: 'uncertainty-confidence', title: 'Measurement noise, uncertainty, and confidence propagation', estimatedMinutes: 40,
    summary: '관측 오차가 파생 측정과 최종 추정으로 어떻게 전달되는지 실험한다.', prerequisites: ['m2','m5','m7'],
    objectives: ['measurement noise와 model confidence를 구분한다.', 'Monte Carlo로 오차 전파를 직관적으로 본다.', '더 나쁜 입력이 더 높은 confidence를 만들면 안 되는 원칙을 이해한다.'],
    concepts: [
      { heading: '한 숫자 뒤의 분포', body: 'landmark가 0.47이라고 나와도 실제 관측에는 흔들림이 있다. 입력을 작은 분포로 보고 반복 계산하면 파생 각도/방향이 얼마나 흔들리는지 볼 수 있다.' },
      { heading: '단조성 안전원칙', body: '정렬 불일치나 관측 노이즈가 커졌는데 결과 uncertainty가 줄거나 confidence가 올라가면 전파 규칙이 이상하다는 강한 신호다.' },
    ],
    sources: [source('Introduction to Probability and Statistics', 'MIT OpenCourseWare', MIT_PROB, 'course'), source('FormPath evaluation docs', 'Rudwpahs · GitHub', `${FORMPATH}docs/evaluation/`, 'project-doc')],
    lab: { id: 'l8', title: 'Monte Carlo 관절 길이 불확실성', packages: [], starterCode: `import random, statistics, math\nrandom.seed(7)\nvals=[]\nfor _ in range(2000):\n    x=.15+random.gauss(0,.01); y=.17+random.gauss(0,.01)\n    vals.append(math.hypot(x,y))\nprint(round(statistics.mean(vals),4), round(statistics.pstdev(vals),4))`, expectedOutput: '평균 길이와 약 0.01 수준의 표준편차가 출력됨', explanation: '입력 좌표 노이즈가 길이 측정 분포로 전파된다.' },
    quiz: { id: 'q8', questions: [
      q('q8a','입력 노이즈가 커졌는데 confidence가 상승하면?',['전파 규칙을 의심','항상 정상','3D 증명','FPS 문제만'],'전파 규칙을 의심','악화된 evidence가 결과를 더 확신하게 하면 단조성 위반 가능성이 있다.'),
      q('q8b','Monte Carlo의 목적은?',['입력 변동이 출력에 미치는 영향 관찰','카메라 구매','파일 압축','로그인'],'입력 변동이 출력에 미치는 영향 관찰','반복 샘플로 출력 분포를 본다.'),
      q('q8c','confidence와 물리 오차는 같은 단위인가?',['아니오','예','항상 도 단위','항상 m 단위'],'아니오','서로 다른 품질 표현이다.'),
      q('q8d','uncertainty가 0이면 실제 오차도 0인가?',['반드시 그렇지 않다','항상 그렇다','영상에서만','3D에서만'],'반드시 그렇지 않다','모델이 포착하지 못한 systematic error가 있을 수 있다.'),
      q('q8e','systematic camera bias는 무작위 jitter만으로 잡히나?',['아니오','예','항상','샘플 2개면'],'아니오','편향은 별도 calibration/validation이 필요하다.'),
    ]},
    formPathConnection: { label: 'Evidence cone / confidence propagation', path: 'lib/shooting-profile/reconstruction.ts', explanation: 'cross-view 불일치가 결과 uncertainty/confidence에 반영되는지 검증한다.', evidenceClass: 'synthetic-validation' },
  },
  {
    id: 'm9', slug: 'shooting-biomechanics-coordination', title: 'Basketball shooting biomechanics and coordination', estimatedMinutes: 45,
    summary: '좋은 슛을 하나의 고정 관절각이 아니라 거리·상황·협응 전략의 문제로 본다.', prerequisites: ['m3','m8'],
    objectives: ['거리 변화에 따른 릴리즈·관절 조정을 설명한다.', '개별 각도 템플릿과 coordination의 차이를 이해한다.', '연구 결과를 모든 선수에게 절대 규칙으로 일반화하지 않는다.'],
    concepts: [
      { heading: '거리가 바뀌면 해법도 바뀐다', body: '연구에서는 슈팅 거리가 증가할 때 release velocity, release angle/height, shoulder·elbow·knee 동작 등이 조정되는 패턴이 보고된다. 따라서 “엘리트의 한 각도”를 고정 정답으로 복사하는 접근은 약하다.' },
      { heading: '협응과 맥락', body: '관절 하나의 순간값보다 여러 관절의 순서·속도·변동성이 중요할 수 있다. 상대 수비, 거리, 피로, 개인 체형 같은 과제 제약도 함께 봐야 한다.' },
    ],
    sources: [source('Kinematic analysis with increasing shooting distance', 'PubMed · Caseiro et al. (2023)', PUBMED_DISTANCE, 'peer-reviewed'), source('Shooting kinematics, distance and playing position', 'PubMed', PUBMED_POSITION, 'peer-reviewed')],
    lab: { id: 'l9', title: '거리별 release 변수 변화 읽기', packages: [], starterCode: `shots=[("FT",2.1,52), ("3PT",2.4,48)]\nfor name,velocity,angle in shots:\n    print(name, "speed", velocity, "angle", angle)\nprint("Do not turn this toy data into a universal ideal.")`, expectedOutput: '거리 조건에 따라 값이 달라지는 toy table과 일반화 경고', explanation: '숫자 자체보다 조건에 따른 조정 패턴을 읽는다.' },
    quiz: { id: 'q9', questions: [
      q('q9a','모든 거리에서 하나의 관절각을 정답으로 강제하는 접근은?',['근거가 약할 수 있다','항상 최선','거리와 무관','연구가 증명'],'근거가 약할 수 있다','거리/상황에 따른 조정이 관찰된다.'),
      q('q9b','장거리 슛에서 흔히 조정되는 것은?',['release/관절 운동 변수','선수 이름','공 색','코트 크기만'],'release/관절 운동 변수','kinematics가 과제 요구에 맞춰 변한다.'),
      q('q9c','biomechanics 연구 결과를 개인에게 적용할 때 필요한 것은?',['맥락과 검증','그대로 복제','평균만','키 무시'],'맥락과 검증','집단 평균은 개인 처방 그 자체가 아니다.'),
      q('q9d','coordination은 무엇을 강조하나?',['관절들의 관계와 순서','한 관절의 한 숫자만','공 색상','카메라 브랜드'],'관절들의 관계와 순서','다관절 협응 패턴을 본다.'),
      q('q9e','peer-reviewed 결과도 FormPath 제품 규칙이 되려면?',['제품 데이터에서 별도 검증','즉시 고정 threshold','출처만 있으면 됨','한 선수 영상만'],'제품 데이터에서 별도 검증','연구 외적 타당성과 측정 시스템 차이가 있다.'),
    ]},
    formPathConnection: { label: 'Coaching interpretation boundary', path: 'docs/MOBILE_PRODUCT_POLICY.md', explanation: '제품은 엘리트 복제보다 상황에 맞는 반복 가능한 해결책과 근거 수준을 분리해야 한다.', evidenceClass: 'biomechanics' },
  },
  {
    id: 'm10', slug: 'data-features-splits', title: 'Data representation, features, labels, and train/validation/test separation', estimatedMinutes: 40,
    summary: '모델 입력·정답·평가 세트를 분리하고 leakage가 왜 성능을 부풀리는지 이해한다.', prerequisites: ['m5','m9'],
    objectives: ['feature와 label을 구분한다.', 'train/validation/test 역할을 설명한다.', '동일 선수/세션 leakage 위험을 설명한다.'],
    concepts: [
      { heading: '데이터 한 행의 의미', body: 'feature는 모델이 보는 입력, label/target은 예측하거나 비교할 목표다. FormPath에서는 raw 영상, landmark sequence, derived metrics, coaching label을 같은 데이터 등급으로 섞으면 안 된다.' },
      { heading: 'test는 마지막까지 보지 않는 데이터', body: '전처리·threshold·모델 선택을 test에 맞추면 평가가 낙관적으로 변한다. 특히 같은 선수의 거의 같은 슛이 train과 test에 섞이는 identity/session leakage를 경계해야 한다.' },
    ],
    sources: [source('Common pitfalls and recommended practices', 'scikit-learn', SKLEARN, 'documentation')],
    lab: { id: 'l10', title: '선수 단위 split과 샷 단위 random split 비교', packages: [], starterCode: `shots=[("A",1),("A",2),("B",3),("B",4),("C",5)]\ntrain=[s for s in shots if s[0] in {"A","B"}]\ntest=[s for s in shots if s[0]=="C"]\nprint("train players", sorted(set(x[0] for x in train)))\nprint("test players", sorted(set(x[0] for x in test)))`, expectedOutput: "train players ['A','B']\ntest players ['C']", explanation: 'identity leakage를 줄이기 위한 그룹 기반 분리의 직관.' },
    quiz: { id: 'q10', questions: [
      q('q10a','test set의 역할은?',['최종 일반화 평가','매 epoch 학습','threshold 튜닝 전용','데이터 증강'],'최종 일반화 평가','최종 선택 이후의 독립 평가가 핵심이다.'),
      q('q10b','test 정보로 preprocessing 평균을 학습하면?',['data leakage','정상 augmentation','3D calibration','phase alignment'],'data leakage','test 정보가 학습 과정에 스며든다.'),
      q('q10c','같은 선수의 유사 슛이 train/test에 섞이면?',['identity leakage 위험','항상 좋음','FPS 개선','좌표 정규화'],'identity leakage 위험','모델이 선수 고유 패턴을 외울 수 있다.'),
      q('q10d','feature는?',['모델 입력 표현','무조건 정답','평가 보고서만','사용자 이름'],'모델 입력 표현','예측에 사용되는 관측/파생 변수다.'),
      q('q10e','validation set은 주로?',['모델/threshold 선택','최종 비공개 시험만','원시 영상 저장','로그인'],'모델/threshold 선택','학습 중 선택에 사용하고 test와 분리한다.'),
    ]},
    formPathConnection: { label: 'Evaluation report와 제품 데이터 경계', path: 'lib/shooting-profile/evaluation-report.ts', explanation: 'derived report와 raw evidence를 분리하고 평가 계약을 고정하는 이유를 연결한다.', evidenceClass: 'implementation' },
  },
  {
    id: 'm11', slug: 'pytorch-fundamentals', title: 'PyTorch fundamentals for FormPath-oriented experiments', estimatedMinutes: 45,
    summary: 'tensor, forward pass, loss, gradient, train/eval의 최소 개념을 FormPath 실험 관점에서 배운다.', prerequisites: ['m10'],
    objectives: ['tensor가 무엇인지 설명한다.', 'loss와 gradient의 역할을 안다.', '학습 실험과 제품 inference/규칙 기반 파이프라인을 구분한다.'],
    concepts: [
      { heading: 'Tensor는 숫자 배열 + 계산 그래프의 중심', body: 'PyTorch tensor는 모델 입력, 출력, 파라미터를 표현한다. autograd는 연산 그래프를 따라 loss에 대한 gradient를 계산한다.' },
      { heading: '학습 루프의 최소 구조', body: '입력→모델→예측→loss→backward→optimizer step. 하지만 FormPath 현재 제품의 모든 계산이 신경망 학습이라는 뜻은 아니다. pose model, 규칙/기하 파이프라인, 향후 학습 모델을 구분해야 한다.' },
    ],
    sources: [source('Learn the Basics', 'PyTorch', PYTORCH, 'documentation')],
    lab: { id: 'l11', title: 'tensor 연산을 순수 Python으로 미리 이해하기', packages: [], starterCode: `x=[1.0,2.0,3.0]\nw=[0.2,-0.1,0.5]\ny=sum(a*b for a,b in zip(x,w))\ntarget=2.0\nloss=(y-target)**2\nprint("prediction", round(y,3))\nprint("squared loss", round(loss,3))`, expectedOutput: 'prediction 1.5\nsquared loss 0.25', explanation: '브라우저 Pyodide에는 PyTorch wheel을 강제하지 않는다. 동일 개념을 순수 Python으로 확인한 뒤 공식 PyTorch 튜토리얼과 연결한다.' },
    quiz: { id: 'q11', questions: [
      q('q11a','tensor는 주로 무엇을 표현하나?',['다차원 수치 데이터','URL만','이미지 파일명만','Git branch'],'다차원 수치 데이터','입력/출력/파라미터의 기본 구조다.'),
      q('q11b','loss는?',['예측과 목표의 차이를 수치화','FPS','카메라 위치','로그인 상태'],'예측과 목표의 차이를 수치화','최적화가 줄이려는 목적함수다.'),
      q('q11c','autograd의 핵심 역할은?',['gradient 계산','영상 촬영','파일 압축','pose landmark 직접 생성'],'gradient 계산','연산 그래프를 따라 미분을 계산한다.'),
      q('q11d','모든 FormPath 코드가 PyTorch 모델인가?',['아니오','예','iOS만 예','Python이면 예'],'아니오','기하/규칙/계약/pose inference 등 여러 층이 있다.'),
      q('q11e','test 데이터로 학습 gradient를 계산해야 하나?',['아니오','예','항상','작은 데이터면'],'아니오','평가 데이터의 독립성을 깨뜨린다.'),
    ]},
    formPathConnection: { label: '향후 학습 모델을 현재 파이프라인과 분리해 사고하기', path: 'docs/PROJECT_MAP.md', explanation: '제품 runtime, 검증 asset, evidence, 연구 도구를 서로 다른 구역으로 구분한다.', evidenceClass: 'product-hypothesis' },
  },
  {
    id: 'm12', slug: 'validation-failure-reading-pipeline', title: 'Validation, failure cases, and reading the real FormPath pipeline', estimatedMinutes: 50,
    summary: '정상 예시보다 failure mode·계약·검증 증거를 중심으로 실제 FormPath 코드를 읽는다.', prerequisites: ['m6','m7','m8','m10','m11'],
    objectives: ['synthetic와 real-video validation을 구분한다.', 'typed failure/recapture가 왜 중요한지 설명한다.', 'FormPath 프로젝트 맵을 따라 evidence→pipeline→save boundary를 추적한다.'],
    concepts: [
      { heading: '성공 숫자보다 실패 계약', body: '같은 시점, mirror, phase 검출 실패, 낮은 landmark 품질, 비정상 geometry처럼 언제 결과를 만들지 말아야 하는지가 제품 안전성의 핵심이다.' },
      { heading: 'synthetic ≠ real video', body: '합성 fixture에서 수학/계약/경계가 통과해도 실제 iPhone 촬영·MediaPipe·조명·가림·인체 다양성까지 검증됐다는 뜻은 아니다. 2026-09-06 현재 PR #4의 물리 iPhone smoke gate는 code_complete_but_real_video_validation_blocked / real_video_fixture_unavailable 상태로 기록되어 있다. evidence class를 그대로 표시해야 한다.' },
      { heading: '코드를 call graph로 읽기', body: '입력 landmark → phase alignment → cross-view geometry → reconstruction → uncertainty/quality gate → save envelope 순으로 읽고 각 단계가 실패할 때 partial output을 남기는지 확인한다.' },
    ],
    sources: [source('FormPath Project Map', 'Rudwpahs · GitHub', `${FORMPATH}docs/PROJECT_MAP.md`, 'project-doc'), source('Real-video validation runbook', 'Rudwpahs · GitHub', `${FORMPATH}docs/real-video-validation-runbook.md`, 'project-doc')],
    lab: { id: 'l12', title: '간단한 invariant gate 만들기', packages: [], starterCode: `cases=[("good",.12,True),("duplicate",.001,True),("phase_fail",.12,False)]\nfor name,view_distance,phase_ok in cases:\n    if not phase_ok: verdict="recapture: phase_detection_failed"\n    elif view_distance<.04: verdict="recapture: duplicate_view_projection"\n    else: verdict="admit"\n    print(name, "->", verdict)`, expectedOutput: 'good→admit, duplicate→recapture, phase_fail→recapture', explanation: '실제 threshold를 재검증 없이 일반화하지 말고, 실패가 typed verdict로 드러나야 한다는 연습.' },
    quiz: { id: 'q12', questions: [
      q('q12a','synthetic fixture 통과가 곧 real-video validation인가?',['아니오','예','항상','200개면 예'],'아니오','실환경 오차원을 포함하지 않는다.'),
      q('q12b','품질 게이트 실패 시 좋은 동작은?',['typed recapture와 no partial save','억지로 결과 저장','confidence 1로 설정','오류 숨김'],'typed recapture와 no partial save','실패 원인을 명시하고 불완전 결과를 막는다.'),
      q('q12c','같은 시점 두 영상을 fusion하면?',['cross-view geometry gate가 막아야 함','완벽한 깊이','항상 허용','FPS만 확인'],'cross-view geometry gate가 막아야 함','독립 projection 증거가 부족하다.'),
      q('q12d','real-video validation이 아직 막혀 있다면 UI/문서에서?',['그 사실을 그대로 표시','완료로 표시','합성 결과로 대체','숨김'],'그 사실을 그대로 표시','evidence class를 과장하지 않는다.'),
      q('q12e','pipeline을 읽을 때 저장 경계까지 보는 이유는?',['실패 시 partial output 누출 여부 확인','UI 색상','동영상 길이','폰트'],'실패 시 partial output 누출 여부 확인','계산 실패가 persistence까지 전파되는 계약을 확인한다.'),
    ]},
    formPathConnection: { label: '프로젝트 전체 맵과 검증 게이트', path: 'docs/PROJECT_MAP.md', explanation: 'runtime·asset·evidence·tool 경계를 따라 실제 구현을 읽고 현재 real-video validation 상태를 분리한다.', evidenceClass: 'real-video-validation' },
  },
];

export const evidenceClasses = [
  ['math','수학적 항등식/기하 관계'],
  ['implementation','현재 코드가 실제로 하는 동작'],
  ['synthetic-validation','합성 fixture·sweep로 검증된 범위'],
  ['real-video-validation','실제 촬영 데이터에서 확인된 범위 또는 현재 미완료 상태'],
  ['biomechanics','peer-reviewed 인간 움직임 연구 근거'],
  ['product-hypothesis','아직 검증이 필요한 제품/코칭 가설'],
];

export const glossary = [
  ['Landmark','pose 모델이 프레임에서 추정한 신체 keypoint. 실제 해부학적 관절 중심 ground truth와 동일하다고 가정하지 않는다.'],
  ['Projection','3D 구조가 카메라 영상 평면에 맺힌 2D 표현. 깊이 정보 일부가 사라진다.'],
  ['Shot phase','별도 촬영의 절대 시각 대신 슛 진행 단계를 정규화한 좌표.'],
  ['Triangulation','보정된 여러 카메라의 기하와 대응 관측으로 3D 점을 복원하는 방식. 현재 FormPath 비동시 두 시점 추정과 구분한다.'],
  ['Uncertainty','관측/정렬/모델 오차 때문에 결과가 가질 수 있는 변동 범위에 대한 표현.'],
  ['Data leakage','평가 시점에 알 수 없어야 할 정보가 학습·전처리·모델 선택에 들어가 성능을 부풀리는 현상.'],
];

export function getModuleById(id) { return modules.find((m) => m.id === id); }
export function getModuleBySlug(slug) { return modules.find((m) => m.slug === slug); }
export function getLab(labId) { return modules.find((m) => m.lab.id === labId)?.lab; }
export function getModuleByLab(labId) { return modules.find((m) => m.lab.id === labId); }
export function getQuiz(quizId) { return modules.find((m) => m.quiz.id === quizId)?.quiz; }
export function getModuleByQuiz(quizId) { return modules.find((m) => m.quiz.id === quizId); }
