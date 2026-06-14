# Day 8 Study Note: componentRegistry 확장과 제네릭 타입 이해하기

## 오늘의 목표

여덟째 날의 핵심은 `componentRegistry`를 조금 더 완성하고, 그 과정에서 나온 TypeScript 타입 문법을 이해하는 것이다.

오늘 한 일은 크게 두 가지다.

```txt
1. componentRegistry에 label, defaultProps를 추가했다.
2. ReactComponentType<...>, 제네릭, Extract, 유틸리티 타입을 다시 정리했다.
```

기능 자체는 작지만, 앞으로 컴포넌트 추가, 기본값 생성, schema-driven inspector로 확장할 때 중요한 기반이 된다.

---

## 1. componentRegistry에 무엇을 추가했나?

기존 registry에는 `preview`만 있었다.

```ts
export const componentRegistry = {
  Button: {
    preview: ButtonPreview,
  },
  Card: {
    preview: CardPreview,
  },
  Input: {
    preview: InputPreview,
  },
}
```

오늘은 여기에 `label`과 `defaultProps`를 추가했다.

```ts
export const componentRegistry = {
  Button: {
    label: 'Button',
    preview: ButtonPreview,
    defaultProps: {
      label: 'Save',
      variant: 'primary',
      disabled: false,
    },
  },
  Card: {
    label: 'Card',
    preview: CardPreview,
    defaultProps: {
      title: 'Card Title',
      description: 'Card description',
    },
  },
  Input: {
    label: 'Input',
    preview: InputPreview,
    defaultProps: {
      placeholder: 'Type here',
      disabled: false,
    },
  },
}
```

이제 registry는 단순히 preview만 찾는 표가 아니다.

```txt
component type
  -> 화면에 보여줄 이름(label)
  -> 미리보기 컴포넌트(preview)
  -> 처음 생성할 때 쓸 기본 props(defaultProps)
```

를 한 곳에서 관리하는 설정표가 되었다.

---

## 2. ReactComponentType<...>에서 꺾쇠 안에는 무엇이 들어가나?

이 코드를 봤다.

```ts
preview: ReactComponentType<Extract<EditorNode, { type: Type }>['props']>
```

여기서 `ReactComponentType<...>`의 `<>` 안에 들어가는 것은 타입이다.

정확히는 **제네릭 타입 인자**라고 부른다.

예를 들면 다음과 같다.

```ts
Array<string>
Promise<number>
ReactComponentType<ButtonProps>
Extract<EditorNode, { type: 'Button' }>
```

여기서 `string`, `number`, `ButtonProps`, `EditorNode`, `{ type: 'Button' }`는 모두 타입 자리에 들어간다.

`ReactComponentType<ButtonProps>`는 이렇게 읽을 수 있다.

```txt
ButtonProps를 props로 받는 React 컴포넌트 타입
```

즉 registry의 `preview`는 아무 React 컴포넌트나 받을 수 있는 것이 아니라, 해당 컴포넌트 타입에 맞는 props를 받는 preview 컴포넌트여야 한다.

---

## 3. 제네릭 타입이란?

제네릭은 쉽게 말하면 타입을 나중에 넣을 수 있게 비워둔 문법이다.

예를 들어 배열은 안에 어떤 값이 들어갈지 상황마다 다르다.

```ts
Array<string>
Array<number>
```

`Array`는 배열이라는 틀이고, `string` 또는 `number`는 그 배열 안에 들어갈 값의 타입이다.

직접 제네릭 타입을 만들면 이런 모양이다.

```ts
type Box<T> = {
  value: T
}
```

여기서 `T`는 아직 정해지지 않은 타입 자리다.

```ts
type StringBox = Box<string>
```

이렇게 쓰면 `T` 자리에 `string`이 들어간다.

결과는 다음과 같다.

```ts
type StringBox = {
  value: string
}
```

즉 제네릭은 값이 아니라 타입을 파라미터처럼 넘기는 문법이다.

```txt
함수의 인자
  -> 값

제네릭의 인자
  -> 타입
```

---

## 4. 제네릭은 함수에만 쓰는가?

아니다.

제네릭은 함수에도 쓰고, 타입에도 쓰고, 인터페이스에도 쓰고, 클래스에도 쓴다.

함수 제네릭:

```ts
function wrap<T>(value: T) {
  return { value }
}

wrap<string>('hello')
```

타입 제네릭:

```ts
type Box<T> = {
  value: T
}

type StringBox = Box<string>
```

인터페이스 제네릭:

```ts
interface ApiResponse<T> {
  data: T
  error: string | null
}
```

정확히는 이렇게 이해하면 된다.

```txt
제네릭으로 선언된 대상에만 타입 인자를 넘길 수 있다.
```

그래서 `ReactComponentType`도 React 쪽에서 제네릭 타입으로 만들어져 있기 때문에 다음처럼 쓸 수 있다.

```ts
ReactComponentType<ButtonProps>
```

---

## 5. Extract는 무엇인가?

`Extract`는 TypeScript가 기본으로 제공하는 유틸리티 타입이다.

union 타입에서 특정 조건에 맞는 타입만 뽑아낼 때 쓴다.

예를 들어 `EditorNode`가 이런 union 타입이라고 하자.

```ts
type EditorNode =
  | { id: string; type: 'Button'; props: ButtonProps }
  | { id: string; type: 'Card'; props: CardProps }
  | { id: string; type: 'Input'; props: InputProps }
```

여기서 Button 노드만 뽑고 싶으면 이렇게 쓴다.

```ts
type ButtonNode = Extract<EditorNode, { type: 'Button' }>
```

결과는 다음과 같다.

```ts
type ButtonNode = {
  id: string
  type: 'Button'
  props: ButtonProps
}
```

그래서 이 코드:

```ts
;(Extract < EditorNode, { type: Type } > ['props'])
```

는 이렇게 읽을 수 있다.

```txt
EditorNode union 중에서
type이 Type인 항목을 고르고
그 항목의 props 타입만 꺼낸다.
```

예를 들어 `Type`이 `'Button'`이면 결과는 `ButtonProps`다.

---

## 6. PropsOf 같은 타입 별명

긴 타입은 읽기 어렵다.

```ts
;(Extract < EditorNode, { type: Type } > ['props'])
```

그래서 이 타입에 이름을 붙일 수 있다.

```ts
type PropsOf<Type extends EditorNode['type']> = Extract<EditorNode, { type: Type }>['props']
```

그러면 아래 두 코드는 같은 뜻이다.

```ts
ReactComponentType<Extract<EditorNode, { type: Type }>['props']>
```

```ts
ReactComponentType<PropsOf<Type>>
```

`PropsOf`는 TypeScript 내장 타입이 아니다.

직접 만든 타입 별명이다.

이름 그대로 이렇게 읽으면 된다.

```txt
PropsOf<'Button'>
  -> Button의 props
  -> ButtonProps
```

---

## 7. Extract를 쓰지 않는 방법

현재 프로젝트에는 이미 `ComponentPropsMap`이 있다.

```ts
export type ComponentPropsMap = {
  Button: ButtonProps
  Card: CardProps
  Input: InputProps
}
```

그래서 `Extract` 대신 map 타입에서 바로 꺼낼 수도 있다.

```ts
ComponentPropsMap[Type]
```

예를 들어:

```ts
ComponentPropsMap['Button']
```

의 결과는 `ButtonProps`다.

그래서 registry 타입을 이렇게 쓸 수도 있다.

```ts
type ComponentRegistry = {
  [Type in ComponentType]: {
    label: string
    preview: ReactComponentType<ComponentPropsMap[Type]>
    defaultProps: ComponentPropsMap[Type]
  }
}
```

두 방식의 차이는 다음과 같다.

```txt
Extract 방식
  -> EditorNode union에서 type이 맞는 항목을 찾아 props를 꺼낸다.

ComponentPropsMap 방식
  -> ComponentPropsMap에서 Type 키에 해당하는 props를 바로 꺼낸다.
```

이미 map 타입이 있다면 `ComponentPropsMap[Type]`가 더 읽기 쉬울 수 있다.

반대로 union 타입만 있다면 `Extract`가 자연스럽다.

---

## 8. 유틸리티 타입이란?

유틸리티 타입은 TypeScript가 기본으로 제공하는 타입 가공 도구다.

이미 있는 타입을 재료로 새 타입을 만들어준다.

자주 보는 유틸리티 타입은 다음과 같다.

```txt
Pick
Omit
Partial
Required
Readonly
Record
Extract
Exclude
ReturnType
Parameters
```

예를 들어 `Pick`은 일부 속성만 고른다.

```ts
type User = {
  id: string
  name: string
  email: string
}

type UserPreview = Pick<User, 'id' | 'name'>
```

결과:

```ts
type UserPreview = {
  id: string
  name: string
}
```

`Omit`은 일부 속성을 뺀다.

```ts
type UserWithoutEmail = Omit<User, 'email'>
```

`Partial`은 모든 속성을 optional로 만든다.

```ts
type UserUpdateInput = Partial<User>
```

`Extract`는 union에서 특정 타입만 뽑는다.

```ts
type SuccessResult = Extract<ApiResult, { status: 'success' }>
```

한마디로 유틸리티 타입은 다음과 같다.

```txt
기존 타입을 재료로 새 타입을 만들어주는 TypeScript 내장 도구
```

---

## 오늘의 정리

오늘 이해한 핵심은 다음과 같다.

```txt
ReactComponentType<...>
  -> ... 타입을 props로 받는 React 컴포넌트 타입

<> 안
  -> 값이 아니라 타입이 들어간다.

제네릭
  -> 타입을 파라미터처럼 넘기는 문법

Extract
  -> union 타입에서 특정 조건에 맞는 타입만 뽑는 유틸리티 타입

유틸리티 타입
  -> 기존 타입을 가공해서 새 타입을 만드는 TypeScript 내장 도구
```

그리고 `componentRegistry`는 이제 다음 정보를 한 곳에서 관리한다.

```txt
label
preview
defaultProps
```

이 구조는 나중에 `propsSchema`를 붙여 Inspector를 자동화하는 발판이 된다.
