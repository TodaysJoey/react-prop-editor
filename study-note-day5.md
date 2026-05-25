# Day 5 Study Note: 배열 안의 특정 컴포넌트 props 업데이트하기

## 오늘의 목표

다섯째 날의 핵심은 오른쪽 `InspectorPane`에서 값을 바꿨을 때, 실제 `components` state가 업데이트되고 가운데 `PreviewPane`이 바로 다시 렌더링되게 만드는 것이다.

오늘 확인한 결론부터 말하면, 현재 프로젝트에는 이 기능이 이미 구현되어 있다.

다만 강의 예시처럼 `handlePropChange(id, key, value)`라는 이름의 함수로 만든 것은 아니고, `InspectorPane`에서 수정된 컴포넌트 객체를 만든 뒤 `App.tsx`의 `updateComponent` 함수로 배열 안의 해당 항목을 교체하는 방식이다.

흐름은 이렇게 볼 수 있다.

```txt
InspectorPane input 변경
  -> 새 component 객체 생성
  -> onChangeComponent 호출
  -> App의 updateComponent 실행
  -> components 배열에서 같은 id만 교체
  -> selectedComponent가 새 데이터가 됨
  -> PreviewPane이 새 props로 다시 렌더링
```

---

## 1. 이미 구현된 핵심 코드

`App.tsx`에는 `components` 배열 state가 있다.

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

그리고 선택된 컴포넌트를 찾는다.

```tsx
const selectedComponent = components.find((component) => component.id === selectedComponentId)
```

`InspectorPane`에서 수정된 컴포넌트가 올라오면 `updateComponent`가 실행된다.

```tsx
const updateComponent = (nextComponent: ComponentItem) => {
  setComponents((currentComponents) =>
    currentComponents.map((component) =>
      component.id === nextComponent.id ? nextComponent : component,
    ),
  )
}
```

이 코드는 배열 전체를 직접 수정하지 않는다.

대신 기존 배열을 `map`으로 돌면서:

```txt
id가 같은 component
  -> nextComponent로 교체

id가 다른 component
  -> 기존 component 그대로 유지
```

한다.

즉 "배열 안의 특정 객체 하나만 새 객체로 교체하기" 패턴이다.

---

## 2. 왜 이 기능이 React 상태 업데이트 감각을 키워줄까?

이 기능은 단순히 input 값을 바꾸는 작업처럼 보이지만, 실제로는 React에서 아주 자주 나오는 문제를 다룬다.

바꾸고 싶은 값은 전체 배열이 아니다.

정확히는:

```txt
components 배열 안의
특정 id를 가진 객체의
props 안의
특정 key 값
```

이다.

예를 들어 Button의 label을 바꾼다면 실제 목표는 이 부분이다.

```ts
{
  id: 'btn-1',
  type: 'Button',
  props: {
    label: 'Save',
    variant: 'primary',
    disabled: false,
  },
}
```

여기서 `props.label`만 바꾸고 싶다.

React에서는 이런 중첩된 상태를 직접 수정하지 않고 새 배열, 새 객체를 만들어 교체하는 방식이 중요하다.

```tsx
setComponents((prev) =>
  prev.map((item) =>
    item.id === selectedId
      ? { ...item, props: { ...item.props, [key]: value } }
      : item,
  ),
)
```

이 한 줄 안에는 React 상태 업데이트의 핵심 감각이 들어 있다.

```txt
1. 이전 state를 기준으로 다음 state를 만든다.
2. 배열은 새 배열로 만든다.
3. 바꿀 객체는 새 객체로 만든다.
4. 중첩된 props도 새 객체로 만든다.
5. 바꾸지 않는 항목은 그대로 유지한다.
```

이 패턴은 todo 수정, 장바구니 수량 변경, 폼 필드 수정, 블록 에디터 속성 변경 같은 곳에서 계속 반복된다.

---

## 3. InspectorPaneProps는 무엇을 담고 있을까?

`InspectorPane.tsx`에는 이런 props 타입이 있다.

```tsx
type InspectorPaneProps = {
  component?: ComponentItem
  onChangeComponent: (component: ComponentItem) => void
}
```

뜻은 `InspectorPane`이 두 가지 값을 받는다는 것이다.

```txt
component
  -> 현재 선택된 컴포넌트 데이터

onChangeComponent
  -> 수정된 컴포넌트를 App으로 올려보내는 함수
```

`component` 뒤에 `?`가 붙어 있기 때문에 `component`는 없을 수도 있다.

```tsx
component?: ComponentItem
```

왜냐하면 `selectedComponentId`에 해당하는 컴포넌트를 찾지 못하면 `undefined`가 될 수 있기 때문이다.

그래서 `InspectorPane`에서는 먼저 이 경우를 처리한다.

```tsx
if (!component) {
  return (
    <aside className="inspector-pane">
      <h2>Inspector</h2>
      <p className="inspector-empty">선택된 컴포넌트가 없습니다.</p>
    </aside>
  )
}
```

---

## 4. ComponentItem은 전개 연산자로 펼칠 수 있을까?

가능하다.

`ComponentItem`은 TypeScript 타입 이름일 뿐이고, 실제 값은 평범한 JavaScript 객체다.

예를 들어 Button 컴포넌트 데이터는 이런 객체다.

```ts
{
  id: 'btn-1',
  type: 'Button',
  props: {
    label: 'Save',
    variant: 'primary',
    disabled: false,
  },
}
```

객체이기 때문에 이렇게 전개할 수 있다.

```tsx
{
  ...component,
  props: {
    ...component.props,
    label: event.target.value,
  },
}
```

이 코드는 이렇게 이해할 수 있다.

```txt
기존 component의 id, type 등은 유지한다.
props는 새 객체로 만든다.
기존 props 값은 유지한다.
label만 새 값으로 덮어쓴다.
```

즉 아래와 비슷한 의미다.

```tsx
{
  id: component.id,
  type: component.type,
  props: {
    ...component.props,
    label: event.target.value,
  },
}
```

---

## 5. 전개 연산자는 배열에만 쓰는 것이 아니다

JavaScript의 `...`는 배열에도 쓰고 객체에도 쓴다.

배열 전개:

```ts
const nums = [1, 2, 3]

const nextNums = [...nums, 4]
// [1, 2, 3, 4]
```

객체 전개:

```ts
const user = {
  name: 'Jihyun',
  age: 20,
}

const nextUser = {
  ...user,
  age: 21,
}
```

결과:

```ts
{
  name: 'Jihyun',
  age: 21,
}
```

객체 전개에서 순서는 중요하다.

```ts
const user = { name: 'Jihyun', age: 20 }

const a = {
  ...user,
  age: 21,
}
```

결과:

```ts
{ name: 'Jihyun', age: 21 }
```

뒤에 있는 `age: 21`이 앞의 `age: 20`을 덮어쓴다.

반대로 쓰면 결과가 달라진다.

```ts
const b = {
  age: 21,
  ...user,
}
```

결과:

```ts
{ name: 'Jihyun', age: 20 }
```

뒤에 온 `...user`가 `age: 21`을 다시 덮어쓴다.

그래서 React에서는 보통 이런 순서로 쓴다.

```tsx
{
  ...기존객체,
  바꿀키: 새값,
}
```

---

## 6. 유니온 타입이란?

유니온 타입은 "여러 타입 중 하나일 수 있다"는 뜻이다.

TypeScript에서는 `|` 기호로 유니온 타입을 만든다.

쉬운 예시는 이것이다.

```ts
type Status = 'idle' | 'loading' | 'success' | 'error'
```

`Status`는 아무 문자열이나 될 수 있는 것이 아니다.

아래 네 값 중 하나만 가능하다.

```txt
idle
loading
success
error
```

그래서 이 코드는 가능하다.

```ts
const status: Status = 'loading'
```

하지만 이 코드는 불가능하다.

```ts
const status: Status = 'done'
```

`ComponentItem`도 유니온 타입이다.

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
  | {
      id: string
      type: 'Input'
      props: {
        placeholder: string
        disabled: boolean
      }
    }
```

여기서 `|`는 이렇게 읽으면 된다.

```txt
Button 모양 객체
또는 Card 모양 객체
또는 Input 모양 객체
```

즉 `ComponentItem`은 셋 중 하나다.

---

## 7. 구별된 유니온

`ComponentItem`은 그냥 유니온 타입이 아니라 구별된 유니온으로 볼 수 있다.

각 객체에 `type`이라는 공통 필드가 있고, 그 값이 다르기 때문이다.

```ts
type: 'Button'
type: 'Card'
type: 'Input'
```

이런 구조에서는 TypeScript가 조건문을 보고 타입을 좁혀준다.

```tsx
if (component.type === 'Button') {
  component.props.label
}
```

이 안에서 TypeScript는 이렇게 이해한다.

```txt
component.type이 Button이네.
그러면 component는 Button 모양 객체구나.
그러면 props에는 label, variant, disabled가 있겠구나.
```

그래서 Button 분기 안에서는 `component.props.label`에 안전하게 접근할 수 있다.

Card 분기 안에서는 `title`, `description`에 접근할 수 있다.

```tsx
if (component.type === 'Card') {
  component.props.title
  component.props.description
}
```

Input 분기 안에서는 `placeholder`, `disabled`에 접근할 수 있다.

```tsx
if (component.type === 'Input') {
  component.props.placeholder
  component.props.disabled
}
```

이게 `ComponentItem` 타입이 좋은 이유다.

하나의 배열에 여러 종류의 컴포넌트를 담을 수 있으면서도, 각 컴포넌트 타입에 맞는 props를 TypeScript가 안전하게 지켜준다.

---

## 8. 구별된 유니온 예시

구별된 유니온은 프로젝트 밖에서도 자주 나온다.

핵심은 항상 같다.

```txt
공통 필드 하나가 있다.
그 필드 값에 따라 나머지 데이터 모양이 달라진다.
```

보통 구별자 이름은 `type`, `kind`, `status`, `state`, `role` 같은 것을 많이 쓴다.

### API 요청 상태

API 요청 상태는 구별된 유니온으로 표현하기 좋다.

```ts
type RequestState =
  | {
      status: 'idle'
    }
  | {
      status: 'loading'
    }
  | {
      status: 'success'
      data: string[]
    }
  | {
      status: 'error'
      message: string
    }
```

여기서 구별자는 `status`다.

```tsx
function render(state: RequestState) {
  if (state.status === 'success') {
    return state.data.join(', ')
  }

  if (state.status === 'error') {
    return state.message
  }

  if (state.status === 'loading') {
    return '로딩 중'
  }

  return '아직 요청 전'
}
```

`state.status === 'success'` 안에서는 TypeScript가 `state.data`가 있다는 것을 안다.

`state.status === 'error'` 안에서는 `state.message`가 있다는 것을 안다.

### 결제 수단

결제 수단처럼 종류에 따라 필요한 정보가 달라지는 경우에도 잘 맞는다.

```ts
type PaymentMethod =
  | {
      kind: 'card'
      cardNumber: string
      expiry: string
    }
  | {
      kind: 'bank'
      accountNumber: string
      bankName: string
    }
  | {
      kind: 'paypal'
      email: string
    }
```

여기서 구별자는 `kind`다.

```ts
function getPaymentLabel(method: PaymentMethod) {
  switch (method.kind) {
    case 'card':
      return `Card ${method.cardNumber}`

    case 'bank':
      return `${method.bankName} ${method.accountNumber}`

    case 'paypal':
      return method.email
  }
}
```

`method.kind`가 `'card'`이면 `cardNumber`, `expiry`를 사용할 수 있다.

`method.kind`가 `'bank'`이면 `bankName`, `accountNumber`를 사용할 수 있다.

### 알림 메시지

알림 메시지도 종류에 따라 추가 정보가 달라질 수 있다.

```ts
type Toast =
  | {
      type: 'success'
      title: string
    }
  | {
      type: 'error'
      title: string
      errorCode: number
    }
  | {
      type: 'action'
      title: string
      actionLabel: string
      onAction: () => void
    }
```

여기서 구별자는 `type`이다.

```ts
function showToast(toast: Toast) {
  if (toast.type === 'error') {
    console.log(toast.errorCode)
  }

  if (toast.type === 'action') {
    toast.onAction()
  }
}
```

`type`이 `'action'`일 때만 `onAction`이 있다.

그래서 아무 곳에서나 `toast.onAction()`을 호출하면 안 되고, 먼저 `toast.type`을 확인해야 한다.

### UI 블록

지금 프로젝트의 `ComponentItem`과 가장 비슷한 예시는 UI 블록이다.

```ts
type Block =
  | {
      type: 'text'
      props: {
        content: string
      }
    }
  | {
      type: 'image'
      props: {
        src: string
        alt: string
      }
    }
  | {
      type: 'divider'
      props: {
        thickness: number
      }
    }
```

렌더링할 때는 `type`을 보고 나눈다.

```tsx
function renderBlock(block: Block) {
  switch (block.type) {
    case 'text':
      return <p>{block.props.content}</p>

    case 'image':
      return <img src={block.props.src} alt={block.props.alt} />

    case 'divider':
      return <hr style={{ borderWidth: block.props.thickness }} />
  }
}
```

이 구조는 현재 프로젝트의 `ComponentItem`과 거의 같다.

```txt
type: 'Button'
  -> Button props

type: 'Card'
  -> Card props

type: 'Input'
  -> Input props
```

구별된 유니온을 알아보는 법은 다음과 같다.

```txt
1. 여러 객체 타입이 | 로 묶여 있다.
2. 모든 객체에 같은 이름의 필드가 있다.
3. 그 필드 값이 각각 다른 문자열 리터럴이다.
4. 그 필드 값에 따라 나머지 속성이 달라진다.
```

---

## 9. 오늘의 핵심 정리

오늘 익힌 핵심은 다음과 같다.

```txt
React state는 직접 수정하지 않는다.
배열은 새 배열로 만든다.
객체는 새 객체로 만든다.
중첩 객체도 새 객체로 만든다.
전개 연산자는 배열뿐 아니라 객체에도 쓴다.
유니온 타입은 여러 타입 중 하나를 의미한다.
ComponentItem은 Button 또는 Card 또는 Input 객체다.
type 필드로 어떤 객체인지 구별할 수 있다.
```

현재 프로젝트의 Day 5 기능은 이미 동작하는 상태다.

중요한 건 코드를 외우는 것보다 이 감각을 잡는 것이다.

```txt
어떤 데이터를 바꿀지 찾는다.
바뀌는 부분만 새로 만든다.
나머지는 그대로 유지한다.
setState로 새 state를 넣는다.
화면은 state를 따라 다시 그려진다.
```
