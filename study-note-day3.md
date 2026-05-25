# Day 3 Study Note: 선택된 데이터를 실제 Preview로 렌더링하기

## 오늘의 목표

셋째 날의 핵심은 가운데 영역을 진짜 Preview처럼 만드는 것이다.

왼쪽 `Sidebar`는 "무엇을 선택했는가"를 담당하고, 가운데 `PreviewPane`은 "선택된 데이터를 어떻게 보여줄까"를 담당한다.

즉 오늘의 구조는 이렇게 나뉜다.

```txt
App
  - 선택 상태를 가지고 있음
  - 선택된 component 데이터를 찾음

Sidebar
  - component 목록을 보여줌
  - 클릭하면 선택 id를 바꿈

PreviewPane
  - 선택된 component 데이터를 받음
  - type에 따라 다른 preview 컴포넌트를 렌더링함
```

---

## 1. 선택된 데이터 찾기

`App.tsx`에는 전체 컴포넌트 데이터와 선택된 id가 있다.

```tsx
const [selectedComponentId, setSelectedComponentId] = useState('btn-1')
```

이 id를 이용해서 실제 선택된 데이터를 찾는다.

```tsx
const selectedComponent = components.find(
  (component) => component.id === selectedComponentId
)
```

여기서 `selectedComponentId`는 "현재 선택된 컴포넌트의 id"이고, `selectedComponent`는 "그 id에 해당하는 실제 데이터"다.

예를 들어 `selectedComponentId`가 `'card-1'`이면:

```ts
{
  id: 'card-1',
  type: 'Card',
  props: {
    title: 'Card Title',
    description: 'Card description',
  },
}
```

이 데이터가 선택된다.

---

## 2. PreviewPane에 선택된 데이터 넘기기

`App.tsx`에서 찾은 선택 데이터를 `PreviewPane`에 넘긴다.

```tsx
<PreviewPane component={selectedComponent} />
```

이제 `PreviewPane`은 직접 전체 목록을 알 필요가 없다.

그냥 "지금 보여줄 component 하나"만 받으면 된다.

이렇게 하면 역할이 분리된다.

```txt
App:
어떤 데이터가 선택되었는지 계산한다.

PreviewPane:
받은 데이터를 화면에 어떻게 보여줄지 결정한다.
```

---

## 3. type에 따라 다른 컴포넌트 렌더링하기

`PreviewPane`은 선택된 component의 `type`을 보고 어떤 preview를 보여줄지 결정한다.

```tsx
switch (component.type) {
  case 'Button':
    return <ButtonPreview {...component.props} />
  case 'Card':
    return <CardPreview {...component.props} />
  case 'Input':
    return <InputPreview {...component.props} />
}
```

여기서 중요한 점은 `ButtonPreview`, `CardPreview`, `InputPreview`가 각각 자기 props만 신경 쓴다는 것이다.

```tsx
<ButtonPreview label="Save" variant="primary" disabled={false} />
```

```tsx
<CardPreview title="Card Title" description="Card description" />
```

```tsx
<InputPreview placeholder="Type here" disabled={false} />
```

`PreviewPane`은 분기만 담당하고, 실제 모양은 각 preview 컴포넌트가 담당한다.

---

## 4. props를 넘겨서 실제 UI 바꾸기

오늘 만든 preview 컴포넌트들은 데이터를 받아서 실제 UI에 반영한다.

### ButtonPreview

```tsx
type ButtonPreviewProps = {
  label: string
  variant: 'primary' | 'secondary'
  disabled: boolean
}
```

`label`은 버튼 안의 텍스트가 되고, `variant`는 버튼 스타일이 되고, `disabled`는 클릭 가능 여부가 된다.

```tsx
<button className={`preview-button preview-button-${variant}`} disabled={disabled}>
  {label}
</button>
```

### CardPreview

```tsx
type CardPreviewProps = {
  title: string
  description: string
}
```

`title`과 `description`이 카드 안의 내용으로 들어간다.

### InputPreview

```tsx
type InputPreviewProps = {
  placeholder: string
  disabled: boolean
}
```

`placeholder`와 `disabled`가 실제 input에 반영된다.

---

## 5. useState는 왜 값과 setter를 같이 꺼낼까?

`useState`는 두 개짜리 배열을 반환한다.

```tsx
const [selectedComponentId, setSelectedComponentId] = useState('btn-1')
```

위 코드는 아래처럼 이해할 수 있다.

```tsx
const result = useState('btn-1')

const selectedComponentId = result[0]
const setSelectedComponentId = result[1]
```

첫 번째 값은 현재 상태이고, 두 번째 값은 그 상태를 바꾸는 함수다.

React에서는 state를 직접 바꾸면 안 된다.

```tsx
selectedComponentId = 'card-1' // 안 됨
```

대신 setter를 사용한다.

```tsx
setSelectedComponentId('card-1')
```

setter를 호출하면 React는 상태가 바뀐 것을 알고 컴포넌트를 다시 렌더링한다.

---

## 6. useState에 세 번째 값도 있을까?

없다.

`useState`가 반환하는 배열에는 두 값만 있다.

```tsx
const [state, setState] = useState(initialValue)
```

세 번째 값을 꺼내려고 하면 `undefined`다.

```tsx
const [state, setState, third] = useState('btn-1')

console.log(third) // undefined
```

상태가 바뀔 때 다른 작업을 하고 싶다면 `useState`의 세 번째 값을 찾는 것이 아니라, 보통 `useEffect` 같은 다른 Hook을 함께 쓴다.

```tsx
useEffect(() => {
  console.log('선택이 바뀜:', selectedComponentId)
}, [selectedComponentId])
```

---

## 7. 타입에서 ?는 무슨 뜻일까?

타입스크립트에서 `?`는 "이 값은 없어도 된다"는 뜻이다.

```tsx
type PreviewPaneProps = {
  component?: ComponentItem
}
```

이 타입은 `component` prop이 있을 수도 있고, 없을 수도 있다는 뜻이다.

아래 둘 다 가능하다.

```tsx
<PreviewPane component={selectedComponent} />
```

```tsx
<PreviewPane />
```

이번 코드에서 `?`가 필요한 이유는 `find` 때문이다.

```tsx
const selectedComponent = components.find(
  (component) => component.id === selectedComponentId
)
```

`find`는 조건에 맞는 값을 못 찾을 수도 있다.

그래서 결과 타입은 대략 이렇게 된다.

```ts
ComponentItem | undefined
```

따라서 `PreviewPane` 안에서도 component가 없을 때를 처리해야 한다.

```tsx
if (!component) {
  return <p className="preview-empty">선택된 컴포넌트가 없습니다.</p>
}
```

---

## 8. type과 interface는 어떻게 구분해서 쓸까?

`type`과 `interface`는 둘 다 객체의 모양을 설명할 수 있다.

```ts
type ButtonProps = {
  label: string
  disabled: boolean
}
```

```ts
interface ButtonProps {
  label: string
  disabled: boolean
}
```

둘 다 가능하다.

하지만 감각적으로는 이렇게 나누면 좋다.

### interface가 잘 어울리는 경우

객체의 모양을 설명할 때 좋다.

```ts
interface SidebarProps {
  components: ComponentItem[]
  selectedComponentId: string
  onSelectComponent: (id: string) => void
}
```

### type이 잘 어울리는 경우

문자열 선택지, union, 여러 타입 조합에 좋다.

```ts
type ButtonVariant = 'primary' | 'secondary'
```

이번 프로젝트의 `ComponentItem`처럼 `type`에 따라 props 모양이 달라지는 경우에도 `type`이 잘 어울린다.

```ts
export type ComponentItem =
  | {
      id: string
      type: 'Button'
      props: {
        label: string
        variant: 'primary' | 'secondary'
        disabled: boolean
      }
    }
  | {
      id: string
      type: 'Card'
      props: {
        title: string
        description: string
      }
    }
```

이런 구조를 union type이라고 볼 수 있다.

`type`이 `'Button'`이면 button props를 가지고, `type`이 `'Card'`이면 card props를 가진다.

---

## 오늘의 핵심 정리

오늘의 핵심은 데이터와 렌더링을 분리하는 것이다.

```txt
왼쪽:
무엇을 선택했는가

가운데:
선택된 데이터를 어떻게 보여줄까
```

`App`은 선택 상태와 선택된 데이터를 관리한다.

`PreviewPane`은 선택된 데이터의 `type`을 보고 알맞은 preview 컴포넌트를 고른다.

각 preview 컴포넌트는 props를 받아 실제 UI 모양을 만든다.

```txt
데이터
  -> selectedComponent
  -> PreviewPane
  -> ButtonPreview | CardPreview | InputPreview
  -> 실제 화면
```

오늘부터 에디터의 구조가 조금 더 선명해졌다.

"데이터를 바꾸면 preview가 바뀐다"는 흐름의 첫 단계가 만들어진 것이다.
