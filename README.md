# React Prop Editor

React Prop Editor는 컴포넌트를 선택하고, 오른쪽 Inspector에서 props를 수정하면 가운데 Preview에 즉시 반영되는 컴포넌트 편집기입니다.

React의 단방향 데이터 흐름, 컴포넌트 렌더링 최적화, 그리고 **Zustand 전역 상태 관리를 통한 확장 가능한 에디터 아키텍처**를 다루는 학습 프로젝트입니다.

---

## 현재 지원 컴포넌트

- **Button**
  - `label` (Text)
  - `variant` (Select: `primary`, `secondary`)
  - `disabled` (Checkbox)
- **Card**
  - `title` (Text)
  - `description` (Text)
- **Input**
  - `placeholder` (Text)
  - `disabled` (Checkbox)

---

## 컴포넌트 구조 & 데이터 흐름

기존 React의 부모 상태 구조에서 발생하던 불필요한 결합도를 낮추고 리렌더링을 방지하기 위해 **Zustand 전역 상태 저장소(Store)**를 중심축으로 컴포넌트들이 직접 상태를 구독하고 조작하도록 위임(Decoupled)했습니다.

```text
       ┌────────────────────────┐
       │   Zustand Store        │ ◀─── (상태 구독 및 액션 호출)
       │   (useEditorStore)     │
       └─────┬────────────┬─────┘
             │            │
   ┌─────────▼───┐   ┌────▼────────┐
   │ Sidebar.tsx │   │PreviewPane  │
   └─────────────┘   └─────────────┘
   (선택 노드 변경)   (선택 노드 렌더링)
             │            │
             └────┐ ┌─────┘
                  ▼ ▼
          ┌───────────────┐
          │ InspectorPane │
          └───────────────┘
          (선택 노드 속성 동적 편집)
```

* **App:** 렌더링 뼈대 레이아웃만 제공하며 상태를 전혀 직접 가지고 있지 않습니다.
* **Sidebar:** 스토어로부터 `components` 배열을 구독하여 컴포넌트 목록을 출력하고, 클릭 시 선택 액션을 직접 호출합니다.
* **PreviewPane:** 선택된 컴포넌트의 데이터만 정밀하게 구독(Selector)하여 화면에 UI로 실시간 렌더링합니다.
* **InspectorPane:** 선택된 컴포넌트 정보와 업데이트 액션을 구독하여 동적으로 알맞은 속성 편집기 필드(Text, Select, Checkbox)를 그려줍니다.

---

## 핵심 상태 (Zustand Store)

상태와 비즈니스 로직을 완벽히 캡슐화하기 위해 [`useEditorStore.ts`](file:///Users/jihyun/Desktop/workspace/react-prop-editor/src/hooks/useEditorStore.ts) 파일에 단일 저장소를 구성했습니다.

```typescript
interface EditorStore {
  components: EditorNode[]                  // 에디터 컴포넌트 노드 목록
  selectedComponentId: string               // 선택된 컴포넌트 고유 ID
  setSelectedComponentId: (id: string) => void  // 컴포넌트 선택 변경 액션
  updateComponent: (nextComponent: EditorNode) => void  // 컴포넌트 속성 업데이트 액션
}
```

---

## 에디터 데이터 Shape

에디터는 `EditorNode[]` 배열을 편집 데이터의 중심으로 사용합니다. 각 `EditorNode`는 공통으로 `id`, `type`, `props`를 가집니다.

```typescript
type EditorNode = {
  id: string
  type: 'Button' | 'Card' | 'Input'
  props: ButtonProps | CardProps | InputProps
}
```

* `id`: 사이드바 선택과 배열 업데이트에 사용하는 고유 값입니다.
* `type`: 어떤 Preview와 Inspector 설정을 사용할지 결정하는 값입니다.
* `props`: 실제 Preview 컴포넌트에 전달되는 편집 가능한 속성입니다.

---

## 편집 흐름 (Data Update Flow)

1. 사용자가 `Sidebar`에서 다른 컴포넌트를 선택합니다.
2. 스토어의 `setSelectedComponentId` 액션이 트리거되어 선택된 컴포넌트 ID가 변경됩니다.
3. 이를 정밀 구독하고 있던 `PreviewPane`과 `InspectorPane`만 변화를 감지하여 렌더링을 부분 갱신합니다.
4. 사용자가 `InspectorPane`에서 텍스트 상자를 입력하거나 체크박스를 토글하여 속성 값을 수정합니다.
5. 스토어의 `updateComponent` 액션이 직접 호출되어 해당 컴포넌트의 `props`가 업데이트됩니다.
6. 이 업데이트는 오직 속성이 바뀐 프리뷰 노드와 인스펙터 필드만 **정밀하게 타겟하여 리렌더링(Selector-based re-render)**을 수행하며, 변경이 없는 `Sidebar` 컴포넌트는 전혀 리렌더링되지 않습니다.

---

## 전역 상태 관리(Zustand) 도입 이유

1. **획기적인 렌더링 성능 최적화:** 매 타이핑이나 드래그 시 최상위 `App`이 통째로 리렌더링되던 한계를 극복하고, 변경이 발생한 특정 영역만 부분 리렌더링되도록 렌더 스코프를 완전히 고립시켰습니다.
2. **Prop Drilling 지옥 해결:** 컴포넌트 깊이가 깊어질 때를 대비하여 프롭 전달로 인한 컴포넌트 오염과 의존성 증가 문제를 근본적으로 예방했습니다.
3. **관심사 분리 (SoC):** 노드 매핑 및 상태 수정 로직 등의 비즈니스 도메인 규칙을 React UI 뷰 레이어와 명확히 격리하여 코드의 유지보수성을 극대화했습니다.
4. **확장성 확보:** 향후 에디터 개발의 꽃인 **실행 취소(Undo) / 다시 실행(Redo)** 기능을 손쉽게 결합할 수 있는 상태 히스토리 스냅샷 아키텍처 기반을 완성했습니다.

---

## 실행 방법

```bash
pnpm install
pnpm dev
```
