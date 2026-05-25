# Day 4 Study Note: 오른쪽 Inspector로 props 편집하기

## 오늘의 목표

넷째 날의 핵심은 오른쪽 `InspectorPane`에서 선택된 컴포넌트의 props를 직접 수정하는 것이다.

셋째 날까지는 선택된 데이터를 Preview에 보여주기만 했다.

오늘은 한 단계 더 나아가서:

```txt
왼쪽 Sidebar에서 컴포넌트를 선택한다.
오른쪽 Inspector에서 값을 수정한다.
가운데 Preview가 바로 바뀐다.
```

이 흐름을 만든다.

아직 schema-driven 구조까지 가지 않는다.

처음 버전은 `if` 문으로 컴포넌트 타입을 나누는 방식이면 충분하다.

```txt
Button 선택됨
  -> label, variant, disabled 편집

Card 선택됨
  -> title, description 편집

Input 선택됨
  -> placeholder, disabled 편집
```

---

## 1. components를 state로 만들기

기존에는 `components`가 일반 배열이었다.

```tsx
const components: ComponentItem[] = [
  {
    id: 'btn-1',
    type: 'Button',
    props: {
      label: 'Save',
      variant: 'primary',
      disabled: false,
    },
  },
]
```

일반 배열은 값이 바뀌어도 React가 화면을 다시 그려야 한다는 사실을 모른다.

Inspector에서 props를 수정하려면 `components` 자체가 state여야 한다.

그래서 현재 코드는 이렇게 바뀌었다.

```tsx
const [components, setComponents] = useState<ComponentItem[]>([
  {
    id: 'btn-1',
    type: 'Button',
    props: {
      label: 'Save',
      variant: 'primary',
      disabled: false,
    },
  },
])
```

이제 `setComponents`를 호출하면 React가 새 값으로 다시 렌더링한다.

---

## 2. updateComponent 함수

선택된 컴포넌트의 props를 바꾸기 위해 `App.tsx`에 `updateComponent` 함수를 만들었다.

```tsx
const updateComponent = (nextComponent: ComponentItem) => {
  setComponents((currentComponents) =>
    currentComponents.map((component) =>
      component.id === nextComponent.id ? nextComponent : component,
    ),
  )
}
```

이 함수는 전체 배열 중에서 id가 같은 컴포넌트만 새 컴포넌트로 교체한다.

예를 들어 `btn-1`의 label을 바꿨다면:

```txt
btn-1   -> 새 Button 데이터로 교체
card-1  -> 그대로 유지
input-1 -> 그대로 유지
```

여기서 중요한 부분은 `setComponents`에 값을 바로 넣은 것이 아니라 함수를 넣었다는 점이다.

```tsx
setComponents((currentComponents) => {
  return nextComponents
})
```

이런 방식을 함수형 업데이트라고 한다.

함수형 업데이트에서 첫 번째 인자인 `currentComponents`는 React가 알고 있는 최신 state 값이다.

즉:

```tsx
setComponents(새값)
```

은 그냥 state를 새값으로 바꾸는 방식이고,

```tsx
setComponents((현재값) => 다음값)
```

은 현재 state를 기준으로 다음 state를 계산하는 방식이다.

배열 안의 특정 항목만 바꿀 때는 지금처럼 함수형 업데이트를 쓰면 안전하다.

---

## 3. InspectorPane에 선택된 component와 변경 함수를 넘기기

`App.tsx`는 선택된 데이터를 찾고:

```tsx
const selectedComponent = components.find((component) => component.id === selectedComponentId)
```

그 데이터를 `InspectorPane`에도 넘긴다.

```tsx
<InspectorPane component={selectedComponent} onChangeComponent={updateComponent} />
```

이제 `InspectorPane`은 두 가지를 받는다.

- `component`: 지금 편집할 선택된 컴포넌트
- `onChangeComponent`: 수정된 컴포넌트를 App으로 올려보내는 함수

구조는 이렇게 볼 수 있다.

```txt
InspectorPane
  -> input 변경
  -> onChangeComponent 호출
  -> App의 components state 변경
  -> PreviewPane이 새 props로 다시 렌더링
```

---

## 4. controlled input

오늘 가장 중요한 개념은 controlled input이다.

controlled input은 input의 값을 React state가 관리하는 방식이다.

Button의 label input은 이렇게 되어 있다.

```tsx
<input value={component.props.label} onChange={handleLabelChange} />
```

여기서 `value`는 현재 props 값에 연결되어 있다.

```tsx
value={component.props.label}
```

사용자가 글자를 입력하면 `onChange`가 실행된다.

```tsx
const handleLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
  onChangeComponent({
    ...component,
    props: {
      ...component.props,
      label: event.target.value,
    },
  })
}
```

이 코드는 기존 component를 복사한 다음, `props.label`만 새 값으로 바꾼다.

```tsx
{
  ...component,
  props: {
    ...component.props,
    label: event.target.value,
  },
}
```

왜 복사해서 만들까?

React state는 기존 객체를 직접 수정하기보다 새 객체를 만들어 교체하는 방식이 기본이다.

```tsx
component.props.label = event.target.value // 피하는 방식
```

대신:

```tsx
{
  ...component,
  props: {
    ...component.props,
    label: event.target.value,
  },
}
```

이렇게 새 객체를 만든다.

---

## 5. Button, Card, Input을 if 문으로 나누기

이번 버전에서는 `InspectorPane` 안에서 `component.type`을 보고 직접 분기한다.

```tsx
if (component.type === 'Button') {
  return (
    <aside className="inspector-pane">
      <h2>Inspector</h2>
      <label className="inspector-field">
        <span>label</span>
        <input value={component.props.label} onChange={handleLabelChange} />
      </label>
      <label className="inspector-field">
        <span>variant</span>
        <select value={component.props.variant} onChange={handleVariantChange}>
          <option value="primary">primary</option>
          <option value="secondary">secondary</option>
        </select>
      </label>
      <label className="inspector-checkbox">
        <input checked={component.props.disabled} onChange={handleDisabledChange} type="checkbox" />
        <span>disabled</span>
      </label>
    </aside>
  )
}
```

Card일 때는 `title`, `description`만 보여준다.

```tsx
if (component.type === 'Card') {
  return (
    <aside className="inspector-pane">
      <h2>Inspector</h2>
      <label className="inspector-field">
        <span>title</span>
        <input value={component.props.title} onChange={handleTitleChange} />
      </label>
      <label className="inspector-field">
        <span>description</span>
        <input value={component.props.description} onChange={handleDescriptionChange} />
      </label>
    </aside>
  )
}
```

Input일 때는 `placeholder`, `disabled`를 보여준다.

```tsx
<label className="inspector-field">
  <span>placeholder</span>
  <input value={component.props.placeholder} onChange={handlePlaceholderChange} />
</label>
<label className="inspector-checkbox">
  <input checked={component.props.disabled} onChange={handleDisabledChange} type="checkbox" />
  <span>disabled</span>
</label>
```

나중에는 이 구조를 schema 기반으로 바꿀 수 있다.

하지만 처음에는 이런 직접 분기가 오히려 이해하기 좋다.

---

## 6. 텍스트는 input, boolean은 checkbox

props의 타입에 따라 편집 UI도 달라진다.

문자열 값은 `<input />`으로 편집한다.

```tsx
<input value={component.props.label} onChange={handleLabelChange} />
```

boolean 값은 `<input type="checkbox" />`로 편집한다.

```tsx
<input checked={component.props.disabled} onChange={handleDisabledChange} type="checkbox" />
```

여기서 텍스트 input은 `value`를 사용하고, checkbox는 `checked`를 사용한다.

```txt
text input
  -> event.target.value

checkbox
  -> event.target.checked
```

그래서 disabled 변경 함수는 이렇게 생겼다.

```tsx
const handleDisabledChange = (event: ChangeEvent<HTMLInputElement>) => {
  onChangeComponent({
    ...component,
    props: {
      ...component.props,
      disabled: event.target.checked,
    },
  })
}
```

---

## 7. variant 타입

`variant`는 Button의 스타일 종류를 나타내는 props다.

`component.ts`에서는 이렇게 선언되어 있다.

```ts
variant: 'primary' | 'secondary'
```

이 타입은 문자열 리터럴 유니온 타입이다.

뜻은 `variant`가 아무 문자열이나 될 수 있는 것이 아니라, 아래 두 값 중 하나만 가능하다는 뜻이다.

```ts
'primary'
'secondary'
```

가능한 값:

```ts
variant: 'primary'
variant: 'secondary'
```

불가능한 값:

```ts
variant: 'blue'
variant: 'large'
variant: 'hello'
```

`ButtonPreview`에서는 이 값을 CSS 클래스 이름에 사용한다.

```tsx
className={`preview-button preview-button-${variant}`}
```

`variant`가 `'primary'`이면:

```txt
preview-button preview-button-primary
```

`variant`가 `'secondary'`이면:

```txt
preview-button preview-button-secondary
```

가 된다.

---

## 8. variant 관련 변경 전 코드와 현재 코드 비교

처음에는 Button 데이터 안에 `variant` 값만 있었다.

```tsx
props: {
  label: 'Save',
  variant: 'primary',
  disabled: false,
}
```

그리고 Preview에서는 이 값을 받아서 버튼 스타일에만 사용했다.

```tsx
<ButtonPreview {...component.props} />
```

```tsx
const ButtonPreview = ({ label, variant, disabled }: ButtonPreviewProps) => {
  return (
    <button className={`preview-button preview-button-${variant}`} disabled={disabled}>
      {label}
    </button>
  )
}
```

즉 변경 전에는 `variant`가 "보여주기 위한 값"이었다.

Day 4 이후에는 `InspectorPane`에서 이 값을 직접 편집할 수 있게 되었다.

```tsx
<select value={component.props.variant} onChange={handleVariantChange}>
  <option value="primary">primary</option>
  <option value="secondary">secondary</option>
</select>
```

그리고 select 값이 바뀌면 새 component를 만들어 App으로 올려보낸다.

```tsx
const handleVariantChange = (event: ChangeEvent<HTMLSelectElement>) => {
  onChangeComponent({
    ...component,
    props: {
      ...component.props,
      variant: event.target.value as ButtonVariant,
    },
  })
}
```

정리하면:

```txt
변경 전
  variant는 초기 데이터에만 있음
  Preview에서 스타일을 보여주는 데 사용

현재 코드
  variant를 Inspector의 select로 편집 가능
  변경된 variant가 App state에 저장됨
  Preview가 새 스타일로 다시 렌더링됨
```

---

## 9. select 값에 타입 힌트가 필요했던 이유

Button의 `variant` 타입은:

```ts
'primary' | 'secondary'
```

이다.

하지만 select에서 읽은 값인 `event.target.value`는 TypeScript 입장에서 그냥 `string`이다.

```tsx
event.target.value // string
```

왜 그럴까?

HTML의 `<select>`는 어떤 문자열 값이든 가질 수 있는 일반 DOM 요소이기 때문이다.

TypeScript는 JSX 안에 이런 option이 있다고 해서:

```tsx
<option value="primary">primary</option>
<option value="secondary">secondary</option>
```

`event.target.value`가 반드시 `'primary' | 'secondary'`라고까지 자동으로 좁혀주지는 않는다.

그래서 아래처럼 쓰면 타입 관점에서는 문제가 생길 수 있다.

```tsx
variant: event.target.value
```

`variant`는 `'primary' | 'secondary'`만 받을 수 있는데, `event.target.value`는 더 넓은 `string`이기 때문이다.

그래서 현재 코드에서는 `ButtonVariant` 타입을 만들고:

```ts
type ButtonVariant = Extract<ComponentItem, { type: 'Button' }>['props']['variant']
```

select 값을 그 타입으로 알려준다.

```tsx
variant: event.target.value as ButtonVariant
```

이 코드는 TypeScript에게 이렇게 말하는 것과 같다.

```txt
이 select는 primary 또는 secondary만 고를 수 있게 만들었어.
그러니까 이 값은 ButtonVariant로 봐도 돼.
```

---

## 10. Extract는 무엇인가?

현재 코드에는 이런 타입 선언이 있다.

```ts
type ButtonVariant = Extract<ComponentItem, { type: 'Button' }>['props']['variant']
```

`Extract`는 TypeScript의 유틸리티 타입이다.

뜻은:

```txt
ComponentItem 중에서 { type: 'Button' } 조건에 맞는 타입만 뽑아라.
```

`ComponentItem`은 지금 이런 유니온 타입이다.

```txt
Button 타입 | Card 타입 | Input 타입
```

여기서:

```ts
Extract<ComponentItem, { type: 'Button' }>
```

는 Button 타입만 뽑는다.

그 다음 `['props']['variant']`를 붙였으므로 Button의 `props.variant` 타입만 가져온다.

최종 결과는 아래와 같다.

```ts
type ButtonVariant = 'primary' | 'secondary'
```

굳이 이렇게 쓰는 이유는 `component.ts`의 타입과 Inspector의 타입을 연결하기 위해서다.

나중에 Button variant가 이렇게 바뀌면:

```ts
variant: 'primary' | 'secondary' | 'danger'
```

`ButtonVariant`도 자동으로 `'primary' | 'secondary' | 'danger'`가 된다.

---

## 11. 이벤트 타입은 어떻게 알 수 있을까?

현재 label 변경 함수는 이렇게 생겼다.

```tsx
const handleLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
  // ...
}
```

여기서 `HTMLInputElement`는 이 이벤트가 `<input>`에서 온 이벤트라는 뜻이다.

대략 이렇게 대응된다.

```txt
<input />     -> ChangeEvent<HTMLInputElement>
<textarea />  -> ChangeEvent<HTMLTextAreaElement>
<select />    -> ChangeEvent<HTMLSelectElement>
<form />      -> FormEvent<HTMLFormElement>
<button />    -> MouseEvent<HTMLButtonElement>
```

처음부터 다 외울 필요는 없다.

가장 좋은 방법은 먼저 inline으로 작성해보는 것이다.

```tsx
<input
  onChange={(event) => {
    console.log(event)
  }}
/>
```

이렇게 JSX 안에 바로 쓰면 TypeScript가 위치를 보고 `event` 타입을 자동으로 추론한다.

그 다음 VS Code에서 `event`에 마우스를 올리면 타입을 볼 수 있다.

보통 이런 식으로 나온다.

```ts
React.ChangeEvent<HTMLInputElement>
```

그 타입을 확인한 뒤 함수로 빼면 된다.

```tsx
const handleLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
  // ...
}
```

실무에서도 자주 쓰는 방법이다.

```txt
inline으로 먼저 작성
-> event에 마우스 올려 타입 확인
-> 함수 파라미터 타입에 옮겨 적기
```

---

## 12. 오늘의 전체 흐름

오늘 만든 기능은 아래 흐름으로 동작한다.

```txt
1. Sidebar에서 Button을 선택한다.
2. App이 selectedComponent를 찾는다.
3. InspectorPane이 Button용 편집 UI를 보여준다.
4. label input에 새 값을 입력한다.
5. handleLabelChange가 실행된다.
6. onChangeComponent로 수정된 Button 객체를 App에 전달한다.
7. App의 setComponents가 components state를 업데이트한다.
8. App이 다시 렌더링된다.
9. PreviewPane이 변경된 props로 ButtonPreview를 다시 보여준다.
```

즉 오늘의 핵심은 이 문장으로 정리할 수 있다.

```txt
폼의 값은 selectedComponent.props에서 오고,
폼이 바뀌면 App의 components state를 업데이트한다.
```

---

## 오늘 배운 것

- controlled input은 `value` 또는 `checked`를 state 값에 연결하는 방식이다.
- 텍스트 input은 `value`와 `event.target.value`를 사용한다.
- checkbox는 `checked`와 `event.target.checked`를 사용한다.
- `setState((현재값) => 다음값)` 형태에서는 첫 번째 인자가 최신 state 값이다.
- 배열에서 특정 항목만 바꾸려면 `map`으로 새 배열을 만들면 된다.
- `variant: 'primary' | 'secondary'`는 문자열 리터럴 유니온 타입이다.
- `<select>`의 `event.target.value`는 기본적으로 `string`이므로 좁은 타입이 필요할 수 있다.
- 이벤트 타입이 헷갈릴 때는 inline으로 먼저 작성하고 마우스 오버로 타입을 확인하면 된다.
