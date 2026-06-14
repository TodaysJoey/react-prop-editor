# Day 2 Study Note: 선택 상태와 React 렌더링

## 오늘의 목표

Property Editor의 출발점은 "지금 무엇을 편집 중인지"를 아는 것이다.

이를 위해 `selectedComponentId`라는 상태를 만들고, 왼쪽 목록에서 항목을 클릭하면 선택 상태가 바뀌도록 연결한다.

```tsx
const [selectedComponentId, setSelectedComponentId] = useState('btn-1')
```

`selectedComponentId`는 현재 선택된 컴포넌트의 id이고, `setSelectedComponentId`는 선택 상태를 바꾸는 함수다.

---

## 1. 공통 상태는 부모가 들고 있어야 한다

`Sidebar`는 어떤 항목이 선택되었는지 알아야 한다.

`PreviewPane`도 어떤 항목이 선택되었는지 알아야 한다.

이렇게 여러 자식 컴포넌트가 같이 써야 하는 상태는 공통 부모인 `App.tsx`가 가지고 있는 것이 자연스럽다.

```tsx
function App() {
  const [selectedComponentId, setSelectedComponentId] = useState('btn-1')

  return (
    <main className="app-layout">
      <Sidebar
        components={components}
        selectedComponentId={selectedComponentId}
        onSelectComponent={setSelectedComponentId}
      />
      <PreviewPane />
      <InspectorPane />
    </main>
  )
}
```

여기서 `Sidebar`에게 넘겨주는 값은 세 가지다.

- `components`: 왼쪽 목록에 보여줄 데이터
- `selectedComponentId`: 지금 선택된 항목의 id
- `onSelectComponent`: 클릭했을 때 선택 상태를 바꾸는 함수

---

## 2. Sidebar에서 map을 쓰는 이유

React에서 배열을 화면에 그릴 때는 보통 `map`을 쓴다.

이유는 `map`이 "배열을 다른 배열로 변환해서 반환"하기 때문이다.

```tsx
{
  components.map((component) => <button key={component.id}>{component.type}</button>)
}
```

위 코드는 `components` 배열을 버튼 JSX 배열로 바꾼다.

즉 이런 데이터가:

```ts
;[
  { id: 'btn-1', type: 'Button' },
  { id: 'card-1', type: 'Card' },
  { id: 'input-1', type: 'Input' },
]
```

이런 UI로 변환된다.

```tsx
;[<button>Button</button>, <button>Card</button>, <button>Input</button>]
```

### forEach와의 차이

`forEach`는 반복은 하지만 결과를 반환하지 않는다.

```tsx
const result = components.forEach((component) => {
  return <button>{component.type}</button>
})

console.log(result) // undefined
```

그래서 JSX 안에서 목록을 렌더링할 때는 `forEach`보다 `map`이 맞다.

### for...of와의 차이

`for...of`도 사용할 수는 있다.

```tsx
const items = []

for (const component of components) {
  items.push(<button key={component.id}>{component.type}</button>)
}

return <div>{items}</div>
```

하지만 이 경우 JSX를 담을 배열을 직접 만들어야 한다.

목록 데이터를 UI 목록으로 바꾸는 목적이라면 `map`이 더 간단하고 React스럽다.

---

## 3. useState의 역할

`useState`는 단순히 변수 값을 저장하는 도구가 아니다.

핵심 역할은 다음과 같다.

- 값을 기억한다
- 값을 바꾸는 함수를 제공한다
- 값이 바뀌면 React에게 다시 렌더링하라고 알려준다
- 컴포넌트 함수가 다시 실행되어도 이전 상태를 유지한다

일반 변수는 값이 바뀌어도 React가 알 수 없다.

```tsx
let selectedComponentId = 'btn-1'

function setSelectedComponentId(id: string) {
  selectedComponentId = id
}
```

위 코드에서는 값 자체는 바뀌지만, React는 화면을 다시 그려야 한다는 사실을 모른다.

반면 `useState`를 쓰면:

```tsx
const [selectedComponentId, setSelectedComponentId] = useState('btn-1')
```

`setSelectedComponentId('card-1')`를 호출했을 때 React는 상태가 바뀐 것을 알고 컴포넌트를 다시 렌더링한다.

---

## 4. 일반 HTML + JS와 React의 차이

일반 JavaScript에서는 변수와 DOM을 직접 다룬다.

```html
<p id="count">0</p>
<button id="button">+1</button>

<script>
  let count = 0

  document.querySelector('#button').addEventListener('click', () => {
    count += 1
    document.querySelector('#count').textContent = count
  })
</script>
```

여기서는 두 가지 작업을 직접 한다.

```js
count += 1
document.querySelector('#count').textContent = count
```

즉 값도 직접 바꾸고, 화면도 직접 바꾼다.

React에서는 DOM을 직접 찾아서 수정하지 않는다.

```tsx
const [count, setCount] = useState(0)

return <button onClick={() => setCount(count + 1)}>{count}</button>
```

React에서는 상태만 바꾼다.

```tsx
setCount(count + 1)
```

그러면 React가 현재 상태에 맞게 UI를 다시 계산하고, 실제 DOM에서 필요한 부분만 수정한다.

---

## 5. React 리렌더링은 DOM 전체를 다시 만드는 것이 아니다

React 함수형 컴포넌트는 리렌더링될 때 함수가 다시 실행된다.

하지만 함수가 다시 실행된다고 해서 실제 DOM 전체를 지웠다가 다시 만드는 것은 아니다.

React 렌더링은 크게 두 단계로 볼 수 있다.

1. 렌더링 단계: 컴포넌트 함수를 다시 실행해서 새 UI 설명을 만든다.
2. 커밋 단계: 이전 UI 설명과 새 UI 설명을 비교해서 실제 DOM의 필요한 부분만 수정한다.

예를 들어:

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>Counter</h1>
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </div>
  )
}
```

`count`가 `0`에서 `1`로 바뀌면 함수는 다시 실행된다.

하지만 실제 DOM에서는 보통 버튼 안의 텍스트만 바뀐다.

```txt
이전: <button>0</button>
새것: <button>1</button>

실제 변경: 버튼의 텍스트만 1로 수정
```

즉:

```txt
컴포넌트 함수 재실행 = 맞음
DOM 전체 재생성 = 아님
```

---

## 6. React는 어떻게 비교할까?

React는 이전 렌더 결과와 새 렌더 결과를 비교한다.

정확히는 실제 DOM을 직접 비교한다기보다, React Element/Fiber 트리끼리 비교한 뒤 실제 DOM 변경을 최소화한다.

비교 규칙은 크게 세 가지로 이해할 수 있다.

### 1. 타입이 다르면 다른 UI로 본다

이전:

```tsx
<div>Hello</div>
```

새 렌더:

```tsx
<section>Hello</section>
```

`div`에서 `section`으로 타입이 바뀌었으므로 React는 다른 UI로 본다.

컴포넌트도 마찬가지다.

```tsx
<Button />
```

이었다가:

```tsx
<Card />
```

가 되면 다른 타입으로 보고 새로 처리한다.

### 2. 타입이 같으면 props 차이만 반영한다

이전:

```tsx
<button className="sidebar-item">Button</button>
```

새 렌더:

```tsx
<button className="sidebar-item selected">Button</button>
```

둘 다 `button`이므로 DOM 노드는 유지하고 `className`만 바꾼다.

### 3. 목록은 key로 같은 항목인지 판단한다

목록을 렌더링할 때 `key`를 넣는 이유가 여기에 있다.

```tsx
{
  components.map((component) => <button key={component.id}>{component.type}</button>)
}
```

React는 `key`를 보고 이전 항목과 새 항목을 연결한다.

```txt
key: btn-1   Button
key: card-1  Card
key: input-1 Input
```

순서가 바뀌어도 key가 안정적이면 React는 같은 항목임을 알아볼 수 있다.

그래서 목록에서는 가능한 한 `index`보다 데이터의 고유 id를 key로 쓰는 것이 좋다.

```tsx
key={component.id}
```

---

## 오늘의 핵심 정리

React에서 상태는 단순한 변수가 아니다.

상태는 "이 값이 바뀌면 UI도 바뀌어야 한다"는 신호다.

```tsx
const [selectedComponentId, setSelectedComponentId] = useState('btn-1')
```

왼쪽 목록에서 항목을 클릭하면:

```tsx
onSelectComponent(component.id)
```

선택 상태가 바뀐다.

선택 상태가 바뀌면 React는 컴포넌트를 다시 실행해서 새 UI를 계산한다.

하지만 실제 DOM 전체를 새로 만들지는 않고, 이전 결과와 새 결과를 비교해서 필요한 부분만 바꾼다.

오늘의 감각:

```txt
일반 JS:
값 변경 + DOM 변경을 직접 한다.

React:
상태를 변경하면 React가 UI를 다시 계산하고 필요한 DOM 변경만 적용한다.
```
