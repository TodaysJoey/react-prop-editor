# Implementation Plan - Zustand 상태 관리 라이브러리 도입

이 계획은 `react-prop-editor` 프로젝트의 상태 관리를 React 로컬 상태(`useState`)에서 글로벌 상태 관리 라이브러리인 **Zustand**로 점진적으로 전환하는 상세 과정을 다룹니다.

## User Review Required

> [!IMPORTANT]
>
> - **의존성 설치:** 패키지 관리에 `pnpm`을 사용하고 있으므로 `pnpm add zustand` 명령어를 실행할 예정입니다.
> - **컴포넌트 리팩토링 범위:** `Sidebar`, `PreviewPane`, `InspectorPane`이 `App.tsx`로부터 프롭을 받아오던 구조에서, Zustand Store 훅을 직접 호출하여 상태를 가져오는 완전 위임(Decoupled) 구조로 변경합니다. 이로 인해 컴포넌트 프롭 인터페이스가 일부 변경/삭제될 수 있습니다.

## Open Questions

> [!NOTE]
> 혹시 `App.tsx`에서 하위 컴포넌트로 상태를 계속 내려주는 프롭 형태를 유지하길 바라시나요, 아니면 각 컴포넌트가 스토어에서 직접 상태를 구독(Subscribe)하여 리렌더링 성능을 극대화하는 위임 방식을 원하시나요?
> _이 계획서에서는 성능 최적화와 결합도 완화를 위해 **직접 구독하는 위임 방식**을 제안하며 진행하겠습니다._

---

## Proposed Changes

### [Zustand 패키지 설치]

프로젝트의 패키지 매니저 환경에 맞춰 의존성을 추가합니다.

- `pnpm add zustand`

---

### [State Store 및 Hooks]

#### [NEW] [useEditorStore.ts](file:///Users/jihyun/Desktop/workspace/react-prop-editor/src/hooks/useEditorStore.ts)

- Zustand 스토어를 정의하고, 전역 상태(`components`, `selectedComponentId`)와 이를 변경하는 액션(`selectComponent`, `updateComponent`)들을 한데 모읍니다.
- 초기 컴포넌트 데이터는 기존 `App.tsx`에 선언된 3가지 컴포넌트(`Button`, `Card`, `Input`)와 `componentRegistry`의 `defaultProps`를 조합해 기본값으로 지정합니다.

---

### [UI Components 리팩토링]

#### [MODIFY] [App.tsx](file:///Users/jihyun/Desktop/workspace/react-prop-editor/src/app/App.tsx)

- 기존 `components`, `selectedComponentId` 상태 선언(`useState`)과 `updateComponent` 함수를 제거합니다.
- `Sidebar`, `PreviewPane`, `InspectorPane`에 내려주던 복잡한 프롭들을 제거하고, 순수하게 레이아웃만 렌더링하도록 경량화합니다.

#### [MODIFY] [Sidebar.tsx](file:///Users/jihyun/Desktop/workspace/react-prop-editor/src/components/Sidebar.tsx)

- 프롭(`SidebarProps`)을 제거합니다.
- `useEditorStore`를 사용하여 스토어에서 `components` 및 `selectedComponentId`를 가져오고, 클릭 시 `selectComponent` 액션을 직접 호출합니다.

#### [MODIFY] [PreviewPane.tsx](file:///Users/jihyun/Desktop/workspace/react-prop-editor/src/components/PreviewPane.tsx)

- 프롭(`PreviewPaneProps`)을 제거합니다.
- 스토어에서 현재 선택된 컴포넌트(`selectedComponent`)를 동적으로 찾아와 프리뷰 화면을 렌더링합니다.

#### [MODIFY] [InspectorPane.tsx](file:///Users/jihyun/Desktop/workspace/react-prop-editor/src/components/InspectorPane.tsx)

- 프롭(`InspectorPaneProps`)을 제거합니다.
- 스토어에서 현재 선택된 컴포넌트(`selectedComponent`)와 컴포넌트 업데이트 액션(`updateComponent`)을 가져와 동적으로 속성을 편집할 수 있게 연동합니다.

---

## Verification Plan

### Automated Tests & Lint

- `pnpm lint`: 린트 에러가 없는지 검증합니다.
- `pnpm build`: 타입스크립트 빌드가 정상적으로 완료되는지 확인합니다.

### Manual Verification

- 에디터를 실행(`pnpm dev`)하여 다음 기능을 수동 확인합니다.
  1. 사이드바에서 컴포넌트(`Button`, `Card`, `Input`) 변경 시 포커스가 정상 전환되는지 확인
  2. 인스펙터 패널에서 값 수정 시 프리뷰 창과 사이드바 라벨이 즉각적이고 부드럽게 업데이트되는지 확인
  3. 콘솔 로그 및 렌더링 체감이 이전보다 기민하게 반응하는지 검증
