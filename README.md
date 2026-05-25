# React Prop Editor

React Prop Editor는 컴포넌트를 선택하고, 오른쪽 Inspector에서 props를 수정하면 가운데 Preview에 즉시 반영되는 간단한 컴포넌트 편집기입니다.

React의 단방향 데이터 흐름, 부모 상태 관리, props 기반 UI 렌더링을 보여주기 위한 학습 프로젝트입니다.

## 현재 지원 컴포넌트

- Button
  - `label`
  - `variant`: `primary`, `secondary`
  - `disabled`
- Card
  - `title`
  - `description`
- Input
  - `placeholder`
  - `disabled`

## 컴포넌트 구조

```text
App
├─ Sidebar
│  └─ 컴포넌트 목록 표시 및 선택 변경
├─ PreviewPane
│  └─ 선택된 컴포넌트의 props를 실제 UI로 렌더링
│     └─ ButtonPreview / CardPreview / InputPreview
└─ InspectorPane
   └─ 선택된 컴포넌트 타입에 맞는 편집 필드 렌더링
      └─ TextField / SelectField / CheckboxField
```

`componentRegistry`는 컴포넌트 타입과 Preview 컴포넌트를 연결하는 역할을 합니다.

## 핵심 상태

```ts
const [components, setComponents] = useState<EditorNode[]>(...)
const [selectedComponentId, setSelectedComponentId] = useState('btn-1')
```

- `components`: 편집 가능한 컴포넌트 목록과 각 컴포넌트의 props를 저장합니다.
- `selectedComponentId`: 현재 사용자가 선택한 컴포넌트의 id를 저장합니다.
- `selectedComponent`: `components`와 `selectedComponentId`를 기준으로 계산되는 현재 편집 대상입니다.

## 에디터 데이터 shape

현재 에디터는 `EditorNode[]` 배열을 편집 데이터의 중심으로 사용합니다.

각 `EditorNode`는 공통으로 `id`, `type`, `props`를 가집니다.

```ts
type EditorNode = {
  id: string
  type: 'Button' | 'Card' | 'Input'
  props: ButtonProps | CardProps | InputProps
}
```

- `id`: 사이드바 선택과 배열 업데이트에 사용하는 고유 값입니다.
- `type`: 어떤 Preview와 Inspector 설정을 사용할지 결정하는 값입니다.
- `props`: 실제 Preview 컴포넌트에 전달되는 편집 가능한 속성입니다.

`type`에 따라 `props` 모양이 달라집니다. 예를 들어 `Button`은 `label`, `variant`, `disabled`를 가지고, `Card`는 `title`, `description`을 가집니다.

## State 구조

```text
components
├─ Button
│  └─ props: label, variant, disabled
├─ Card
│  └─ props: title, description
└─ Input
   └─ props: placeholder, disabled

selectedComponentId
└─ 현재 선택된 component의 id
```

선택 상태와 편집 대상 데이터를 부모 컴포넌트에서 중앙 관리하고, Preview와 Inspector는 동일한 state를 바라보도록 설계했습니다.

## 편집 흐름

1. 사용자가 `Sidebar`에서 컴포넌트를 선택합니다.
2. `App`의 `selectedComponentId`가 변경됩니다.
3. `App`은 선택된 id로 `selectedComponent`를 찾습니다.
4. `PreviewPane`은 선택된 컴포넌트의 props를 받아 화면에 렌더링합니다.
5. `InspectorPane`은 선택된 컴포넌트 타입에 맞는 편집 필드를 보여줍니다.
6. 사용자가 Inspector 값을 수정하면 `onChangeComponent`가 호출됩니다.
7. `App`의 `components` 상태가 업데이트되고, Preview와 Inspector가 같은 데이터로 다시 렌더링됩니다.

## 왜 부모가 상태를 들고 있는가

Preview와 Inspector가 같은 편집 대상 데이터를 공유해야 하므로, 공통 부모인 `App`에서 선택 상태와 컴포넌트 props를 중앙 관리합니다.

## 다음 단계 계획

1. 컴포넌트 추가 기능
   - 사용자가 새 Button, Card, Input을 목록에 추가할 수 있게 만들기
2. 편집 가능한 props 확장
   - Button size, Card image, Input value 같은 속성 추가하기
3. 설정 저장 기능
   - 편집한 컴포넌트 상태를 localStorage에 저장하고 새로고침 후에도 유지하기

## 실행 방법

```bash
pnpm install
pnpm dev
```
