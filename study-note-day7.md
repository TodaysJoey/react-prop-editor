# Day 7 Study Note: EditorNode와 TypeScript 타입 설계 이해하기

## 오늘의 목표

일곱째 날의 핵심은 새 기능을 추가하는 것이 아니라, 현재 에디터의 타입 구조를 이해하는 것이다.

오늘은 `src/types/editor.ts`에 있는 타입들을 보면서 다음 질문들을 정리했다.

```txt
1. 기존 ComponentItem만 써도 되는데 왜 EditorNode를 쓰는가?
2. EditorState는 왜 필요한가?
3. Type extends ComponentType = ComponentType 문법은 무엇인가?
4. mapped type은 무엇인가?
5. union type은 무엇인가?
```

이 질문들은 당장 UI를 바꾸지는 않지만, 앞으로 schema-driven inspector, JSON export/import, undo/redo를 만들 때 중요한 기반이 된다.

---

## 1. 기존 ComponentItem만 써도 되지 않을까?

기존에는 컴포넌트 하나를 `ComponentItem`이라고 불렀다.

```ts
type ComponentItem =
  | {
      id: string
      type: 'Button'
      props: ButtonProps
    }
  | {
      id: string
      type: 'Card'
      props: CardProps
    }
  | {
      id: string
      type: 'Input'
      props: InputProps
    }
```

이 방식도 틀리지 않다.

현재 규모에서는 `ComponentItem` 하나만 써도 충분히 동작한다.

하지만 이 프로젝트의 방향은 단순한 컴포넌트 미리보기가 아니라 Property Editor다.

그래서 컴포넌트 하나를 "목록 아이템"이 아니라 "에디터 안에 존재하는 편집 대상"으로 보는 편이 더 자연스럽다.

그 이름이 `EditorNode`다.

```txt
ComponentItem
  -> 컴포넌트 목록 안의 아이템 하나

EditorNode
  -> 에디터가 관리하는 편집 가능한 요소 하나
```

지금은 둘이 거의 같은 뜻처럼 보인다.

하지만 나중에 위치, 크기, 잠금 상태 같은 값이 붙으면 `EditorNode`라는 이름이 더 잘 맞는다.

```ts
type EditorNode = {
  id: string
  type: 'Button'
  props: ButtonProps
  position: {
    x: number
    y: number
  }
  locked: boolean
}
```

즉 `EditorNode`는 앞으로 에디터가 커질 것을 대비한 이름이다.

---

## 2. EditorState는 왜 필요한가?

현재 `App.tsx`에는 상태가 나누어져 있다.

```ts
const [components, setComponents] = useState<EditorNode[]>(...)
const [selectedComponentId, setSelectedComponentId] = useState('btn-1')
```

이 상태를 에디터 관점으로 묶으면 이렇게 볼 수 있다.

```ts
type EditorState = {
  nodes: EditorNode[]
  selectedNodeId: string
}
```

뜻은 단순하다.

```txt
nodes
  -> 에디터 안에 있는 모든 편집 대상

selectedNodeId
  -> 그중 현재 선택된 편집 대상의 id
```

여기서 중요한 점은 `nodes`가 배열이라는 것이다.

즉 에디터 안에는 노드가 여러 개 있을 수 있다.

지금도 이미 Button, Card, Input 세 개가 배열에 들어 있다.

```ts
[
  { id: 'btn-1', type: 'Button', props: ... },
  { id: 'card-1', type: 'Card', props: ... },
  { id: 'input-1', type: 'Input', props: ... },
]
```

나중에 JSON export/import를 만들면 저장 대상은 개별 노드 하나가 아니라 전체 에디터 상태가 된다.

```ts
const json = JSON.stringify(editorState)
```

undo/redo를 만들 때도 마찬가지다.

```ts
type HistoryState = {
  past: EditorState[]
  present: EditorState
  future: EditorState[]
}
```

그래서 `EditorState`는 "현재 에디터 전체를 저장한다면 어떤 모양인가?"를 미리 이름 붙인 타입이다.

---

## 3. ComponentType union

현재 컴포넌트 종류는 union type으로 표현한다.

```ts
export type ComponentType = 'Button' | 'Card' | 'Input'
```

union type은 "여러 후보 중 하나"를 뜻한다.

```txt
ComponentType은
  'Button'이거나
  'Card'이거나
  'Input'이다.
```

그래서 이런 값은 가능하다.

```ts
const type: ComponentType = 'Button'
```

하지만 이런 값은 불가능하다.

```ts
const type: ComponentType = 'Modal'
```

`'Modal'`은 `ComponentType` 후보에 없기 때문이다.

이렇게 union type을 쓰면 `type`에 아무 문자열이나 들어오는 것을 막을 수 있다.

---

## 4. props 타입을 map으로 묶기

각 컴포넌트별 props는 따로 정의한다.

```ts
export type ButtonProps = {
  label: string
  variant: 'primary' | 'secondary'
  disabled: boolean
}

export type CardProps = {
  title: string
  description: string
}

export type InputProps = {
  placeholder: string
  disabled: boolean
}
```

그리고 컴포넌트 타입과 props 타입을 하나의 map으로 연결한다.

```ts
export type ComponentPropsMap = {
  Button: ButtonProps
  Card: CardProps
  Input: InputProps
}
```

이 구조가 있으면 TypeScript에게 이렇게 말할 수 있다.

```txt
Button 타입이면 ButtonProps를 사용한다.
Card 타입이면 CardProps를 사용한다.
Input 타입이면 InputProps를 사용한다.
```

실제로 타입을 꺼낼 때는 이렇게 쓴다.

```ts
ComponentPropsMap['Button']
```

결과는 `ButtonProps`다.

```ts
ComponentPropsMap['Card']
```

결과는 `CardProps`다.

---

## 5. Type extends ComponentType = ComponentType

다음 타입을 보자.

```ts
export type ComponentProps<Type extends ComponentType = ComponentType> =
  ComponentPropsMap[Type]
```

여기서 중요한 부분은 이 문법이다.

```ts
<Type extends ComponentType = ComponentType>
```

뜻은 다음과 같다.

```txt
Type이라는 타입 매개변수를 받는다.
단, Type은 ComponentType 중 하나여야 한다.
아무 타입도 넘기지 않으면 기본값으로 ComponentType 전체를 사용한다.
```

현재 `ComponentType`은 이렇다.

```ts
'Button' | 'Card' | 'Input'
```

그래서 가능한 사용은 다음과 같다.

```ts
type ButtonOnlyProps = ComponentProps<'Button'>
```

이 경우 결과는 `ButtonProps`다.

```ts
type CardOnlyProps = ComponentProps<'Card'>
```

이 경우 결과는 `CardProps`다.

반대로 타입을 지정하지 않으면 기본값이 적용된다.

```ts
type AnyComponentProps = ComponentProps
```

이것은 다음과 비슷하다.

```ts
type AnyComponentProps = ComponentProps<ComponentType>
```

결과는 전체 props 후보가 된다.

```ts
ButtonProps | CardProps | InputProps
```

즉 이 문법은 "특정 컴포넌트 props를 꺼낼 수도 있고, 전체 props union으로 쓸 수도 있게" 해준다.

---

## 6. mapped type

다음 코드는 처음 보면 반복문처럼 보인다.

```ts
export type EditorNode<Type extends ComponentType = ComponentType> = {
  [Key in ComponentType]: {
    id: string
    type: Key
    props: ComponentPropsMap[Key]
  }
}[Type]
```

여기서 이 부분이 mapped type이다.

```ts
{
  [Key in ComponentType]: ...
}
```

JavaScript 런타임 반복문은 아니다.

TypeScript가 타입을 만들 때 union을 기준으로 객체 타입을 펼치는 문법이다.

현재 `ComponentType`은 다음 union이다.

```ts
'Button' | 'Card' | 'Input'
```

그러면 mapped type은 대략 이렇게 펼쳐진다.

```ts
{
  Button: {
    id: string
    type: 'Button'
    props: ComponentPropsMap['Button']
  }
  Card: {
    id: string
    type: 'Card'
    props: ComponentPropsMap['Card']
  }
  Input: {
    id: string
    type: 'Input'
    props: ComponentPropsMap['Input']
  }
}
```

`ComponentPropsMap`까지 적용하면 이렇게 볼 수 있다.

```ts
{
  Button: {
    id: string
    type: 'Button'
    props: ButtonProps
  }
  Card: {
    id: string
    type: 'Card'
    props: CardProps
  }
  Input: {
    id: string
    type: 'Input'
    props: InputProps
  }
}
```

즉 mapped type은 "기존 key 목록을 기준으로 새로운 객체 타입을 자동 생성하는 문법"이다.

---

## 7. 마지막의 [Type]은 무엇인가?

`EditorNode` 타입의 마지막에는 `[Type]`이 붙어 있다.

```ts
{
  [Key in ComponentType]: {
    id: string
    type: Key
    props: ComponentPropsMap[Key]
  }
}[Type]
```

이것은 앞에서 만든 객체 타입에서 특정 key의 value 타입을 꺼내는 문법이다.

예를 들어 다음처럼 쓰면:

```ts
EditorNode<'Button'>
```

Type은 `'Button'`이다.

그래서 결과적으로 다음 타입을 꺼낸다.

```ts
{
  Button: ButtonNode
  Card: CardNode
  Input: InputNode
}['Button']
```

결과는 `ButtonNode`다.

```ts
{
  id: string
  type: 'Button'
  props: ButtonProps
}
```

반대로 그냥 `EditorNode`라고 쓰면 기본값 때문에 전체 `ComponentType`을 사용한다.

```ts
EditorNode<ComponentType>
```

이것은 다음과 비슷하다.

```ts
{
  Button: ButtonNode
  Card: CardNode
  Input: InputNode
}['Button' | 'Card' | 'Input']
```

결과는 세 노드 타입의 union이다.

```ts
ButtonNode | CardNode | InputNode
```

즉 `EditorNode`는 전체 노드 union이고, `EditorNode<'Button'>`은 Button 노드 하나만 정확히 꺼낸 타입이다.

---

## 8. Key라는 이름은 꼭 써야 할까?

꼭 `Key`라고 써야 하는 것은 아니다.

다음 코드는 모두 같은 의미다.

```ts
type NodeMap = {
  [Key in ComponentType]: {
    type: Key
    props: ComponentPropsMap[Key]
  }
}
```

```ts
type NodeMap = {
  [NodeType in ComponentType]: {
    type: NodeType
    props: ComponentPropsMap[NodeType]
  }
}
```

```ts
type NodeMap = {
  [ComponentName in ComponentType]: {
    type: ComponentName
    props: ComponentPropsMap[ComponentName]
  }
}
```

중요한 것은 이름이 아니라 이 구조다.

```ts
[변수이름 in 유니온타입]
```

다만 바깥 제네릭 이름이 이미 `Type`이라면 안쪽 mapped type 변수도 `Type`이라고 쓰면 헷갈린다.

그래서 지금 코드는 바깥은 `Type`, 안쪽은 `Key`로 구분했다.

더 읽기 쉽게 하려면 이렇게 쓸 수도 있다.

```ts
export type EditorNode<Type extends ComponentType = ComponentType> = {
  [NodeType in ComponentType]: {
    id: string
    type: NodeType
    props: ComponentPropsMap[NodeType]
  }
}[Type]
```

`NodeType`이라는 이름이 더 설명적일 수도 있다.

---

## 9. discriminated union

`EditorNode`는 결과적으로 다음과 같은 union type이다.

```ts
type EditorNode =
  | {
      id: string
      type: 'Button'
      props: ButtonProps
    }
  | {
      id: string
      type: 'Card'
      props: CardProps
    }
  | {
      id: string
      type: 'Input'
      props: InputProps
    }
```

이런 구조에서 `type`은 구분자 역할을 한다.

```ts
if (component.type === 'Button') {
  component.props.label
}
```

TypeScript는 이 조건문 안에서 `component`가 Button 노드라는 것을 안다.

그래서 `component.props.label`은 가능하다.

하지만 Card props에 있는 `title`은 Button 노드에서 사용할 수 없다.

```ts
if (component.type === 'Button') {
  component.props.title
}
```

이 코드는 타입 에러가 난다.

이런 구조를 discriminated union이라고 한다.

한국어로는 보통 구별된 유니온 또는 식별 가능한 유니온이라고 부른다.

---

## 10. 오늘의 정리

오늘 정리한 타입 구조는 다음과 같다.

```ts
export type ComponentType = 'Button' | 'Card' | 'Input'

export type ComponentPropsMap = {
  Button: ButtonProps
  Card: CardProps
  Input: InputProps
}

export type ComponentProps<Type extends ComponentType = ComponentType> =
  ComponentPropsMap[Type]

export type EditorNode<Type extends ComponentType = ComponentType> = {
  [Key in ComponentType]: {
    id: string
    type: Key
    props: ComponentPropsMap[Key]
  }
}[Type]

export type EditorState = {
  nodes: EditorNode[]
  selectedNodeId: string
}
```

한 문장으로 정리하면 이렇다.

```txt
EditorNode는 type과 props가 정확히 연결된 에디터 노드 타입이다.
EditorState는 여러 EditorNode와 현재 선택된 노드 id를 담는 전체 에디터 상태다.
```

이 구조를 이해하면 다음 단계인 `componentRegistry` 확장과 `propsSchema` 도입이 훨씬 쉬워진다.

앞으로의 방향은 다음과 같다.

```txt
Day 8
  componentRegistry에 label, defaultProps 추가

Day 9
  propsSchema 타입 정의

Day 10
  InspectorPane을 schema 기반 렌더링으로 전환
```
