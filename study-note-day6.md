# Day 6 Study Note: componentRegistry와 Inspector 필드 분리

## 오늘의 목표

여섯째 날의 핵심은 코드를 조금 더 "에디터다운 구조"로 정리하는 것이다.

오늘은 완전한 schema-driven form까지 가지 않았다.

대신 다음 두 가지를 했다.

```txt
1. type별 preview 컴포넌트를 componentRegistry에서 관리한다.
2. InspectorPane 안의 input/select/checkbox UI를 작은 공통 컴포넌트로 분리한다.
```

이렇게 해두면 지금 코드는 너무 복잡해지지 않으면서도, 나중에 `propsSchema`를 붙여 schema-driven form으로 확장할 수 있다.

---

## 1. componentRegistry란?

`componentRegistry`는 컴포넌트 타입별 설정표다.

예전에는 `PreviewPane`에서 컴포넌트 타입을 직접 확인했다.

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

이 방식도 동작은 한다.

하지만 컴포넌트 종류가 늘어나면 `PreviewPane`이 모든 컴포넌트 타입을 직접 알아야 한다.

그래서 타입별 preview 정보를 한 곳에 모았다.

```tsx
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
} satisfies ComponentRegistry
```

이제 `PreviewPane`은 Button, Card, Input을 직접 import해서 switch하지 않는다.

대신 registry에서 꺼내 쓴다.

```tsx
const PreviewComponent = componentRegistry[component.type].preview as ComponentType<
  typeof component.props
>

return <PreviewComponent {...component.props} />
```

흐름은 이렇게 볼 수 있다.

```txt
선택된 component가 있다
  -> component.type을 확인한다
  -> componentRegistry에서 해당 type의 preview를 찾는다
  -> component.props를 넘겨서 렌더링한다
```

---

## 2. 왜 registry를 쓰는가?

registry를 쓰면 타입별 정보를 중앙에서 관리할 수 있다.

지금은 preview만 들어 있다.

```tsx
Button: {
  preview: ButtonPreview,
}
```

하지만 나중에는 여기에 더 많은 정보를 붙일 수 있다.

```tsx
Button: {
  preview: ButtonPreview,
  defaultProps: {
    label: 'Button',
    variant: 'primary',
    disabled: false,
  },
  propsSchema: [
    { name: 'label', label: 'label', type: 'text' },
    { name: 'variant', label: 'variant', type: 'select', options: ['primary', 'secondary'] },
    { name: 'disabled', label: 'disabled', type: 'checkbox' },
  ],
}
```

즉 `componentRegistry`는 나중에 컴포넌트 관련 정보를 모아둘 수 있는 발판이다.

```txt
지금:
type별 preview 관리

나중:
type별 preview + defaultProps + propsSchema 관리
```

---

## 3. schema-driven form이란?

schema-driven form은 폼 UI를 직접 하나하나 쓰는 대신, schema 데이터를 보고 자동으로 폼을 그리는 방식이다.

직접 쓰는 방식:

```tsx
<TextField label="label" value={component.props.label} onChange={handleLabelChange} />
<SelectField
  label="variant"
  value={component.props.variant}
  options={buttonVariantOptions}
  onChange={handleVariantChange}
/>
<CheckboxField
  label="disabled"
  checked={component.props.disabled}
  onChange={handleDisabledChange}
/>
```

schema-driven 방식:

```tsx
const schema = [
  { name: 'label', type: 'text', label: 'label' },
  { name: 'variant', type: 'select', label: 'variant', options: ['primary', 'secondary'] },
  { name: 'disabled', type: 'checkbox', label: 'disabled' },
]
```

그리고 Inspector가 schema를 돌면서 자동으로 필드를 만든다.

```tsx
schema.map((field) => renderField(field))
```

오늘은 여기까지 가지 않았다.

오늘 한 것은 schema-driven form의 직전 단계다.

```txt
반복되는 필드 UI를 TextField, SelectField, CheckboxField로 분리한다.
컴포넌트별 Inspector 분기는 아직 유지한다.
```

---

## 4. 오늘 분리한 Inspector 필드 컴포넌트

### TextField

문자열 값을 수정하는 필드다.

```tsx
type TextFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
}
```

사용 예시:

```tsx
<TextField label="title" value={component.props.title} onChange={handleTitleChange} />
```

### SelectField

여러 선택지 중 하나를 고르는 필드다.

```tsx
type SelectFieldProps<TValue extends string> = {
  label: string
  value: TValue
  options: readonly TValue[]
  onChange: (value: TValue) => void
}
```

사용 예시:

```tsx
const buttonVariantOptions = ['primary', 'secondary'] as const

<SelectField
  label="variant"
  value={component.props.variant}
  options={buttonVariantOptions}
  onChange={handleVariantChange}
/>
```

`SelectField`는 제네릭을 사용한다.

여기서 `TValue`는 선택 가능한 문자열 타입이다.

Button의 variant라면 아래 두 값만 가능하다.

```ts
'primary' | 'secondary'
```

### CheckboxField

boolean 값을 수정하는 필드다.

```tsx
type CheckboxFieldProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}
```

사용 예시:

```tsx
<CheckboxField
  label="disabled"
  checked={component.props.disabled}
  onChange={handleDisabledChange}
/>
```

---

## 5. 오늘 기준으로 적당한 6일차 범위

오늘은 "완전 자동화"가 목표가 아니다.

적당한 범위는 이 정도다.

```txt
1. PreviewPane의 switch를 registry 기반으로 바꾼다.
2. componentRegistry 파일을 만든다.
3. InspectorPane의 반복 UI를 작은 필드 컴포넌트로 나눈다.
4. 컴포넌트별 Inspector 분기는 유지한다.
5. propsSchema는 아직 만들지 않는다.
```

즉 지금은 아래 단계다.

```txt
5일차:
Inspector에서 props를 직접 수정하고 Preview가 갱신된다.

6일차:
Preview 렌더링은 registry에서 관리한다.
Inspector 필드는 공통 컴포넌트로 분리한다.

7일차 이후:
registry에 propsSchema를 붙이고 Inspector를 schema 기반으로 자동 생성한다.
```

---

## 6. ComponentType<Props>란?

`ComponentType<Props>`는 React에서 쓰는 타입이다.

뜻은:

```txt
Props를 받는 React 컴포넌트
```

예를 들어 ButtonPreview가 이런 props를 받는다면:

```tsx
type ButtonPreviewProps = {
  label: string
  variant: 'primary' | 'secondary'
  disabled: boolean
}
```

이 컴포넌트 타입은 이렇게 표현할 수 있다.

```tsx
ComponentType<ButtonPreviewProps>
```

즉:

```txt
ButtonPreviewProps 모양의 props를 받는 컴포넌트
```

현재 코드에서는 이렇게 썼다.

```tsx
ComponentType<typeof component.props>
```

뜻은:

```txt
현재 component.props와 같은 모양의 props를 받는 컴포넌트
```

---

## 7. <> 안에는 무엇이 들어갈까?

`ComponentType<>`의 `<>` 안에는 props 타입이 들어간다.

예시:

```tsx
ComponentType<{
  label: string
  disabled: boolean
}>
```

뜻은:

```txt
label과 disabled props를 받는 React 컴포넌트
```

이 `<>` 문법은 제네릭이라고 부른다.

다른 예시로 배열도 이렇게 쓸 수 있다.

```ts
Array<string>
```

뜻은:

```txt
string만 들어가는 배열
```

그러니까:

```tsx
ComponentType<ButtonPreviewProps>
```

는:

```txt
ButtonPreviewProps를 받는 컴포넌트
```

이다.

---

## 8. as는 무엇인가?

`as`는 TypeScript의 타입 단언이다.

쉽게 말하면:

```txt
TypeScript야, 이 값은 내가 말하는 타입으로 봐줘.
```

현재 코드:

```tsx
const PreviewComponent = componentRegistry[component.type].preview as ComponentType<
  typeof component.props
>
```

뜻은:

```txt
componentRegistry에서 꺼낸 preview를
현재 component.props를 받을 수 있는 React 컴포넌트로 봐줘.
```

왜 필요할까?

사람 눈에는 `component.type`이 Button이면 `ButtonPreview`를 꺼내고, `component.props`도 Button props라는 것이 자연스럽다.

하지만 TypeScript는 이 둘이 항상 정확히 연결된다고 완벽하게 추론하지 못할 수 있다.

그래서 `as`로 타입을 알려준 것이다.

주의할 점:

```ts
const value = 'hello' as number
```

이런 말도 억지로 할 수 있다.

하지만 실제 런타임 값이 숫자로 바뀌는 것은 아니다.

`as`는 값을 바꾸는 문법이 아니라 TypeScript 검사기에게 타입을 이렇게 보라고 말하는 문법이다.

---

## 9. 왜 Object라고 쓰면 안 될까?

`component.props`는 객체가 맞다.

그래서 처음에는 이렇게 생각할 수 있다.

```tsx
ComponentType<Object>
```

하지만 `Object`는 너무 넓다.

`Object`는 거의 이런 뜻이다.

```txt
뭔가 객체임
```

반면 Button props는 더 구체적인 모양을 가진다.

```ts
{
  label: string
  variant: 'primary' | 'secondary'
  disabled: boolean
}
```

TypeScript에서는 단순히 "객체다"보다 "어떤 모양의 객체다"가 중요하다.

그래서:

```tsx
ComponentType<Object>
```

는 타입 정보를 많이 잃는다.

반면:

```tsx
ComponentType<typeof component.props>
```

는 현재 props의 모양을 따라간다.

```txt
Button이면 label, variant, disabled
Card면 title, description
Input이면 placeholder, disabled
```

즉 `Object`는 "가방"이라고만 말하는 것이고, `typeof component.props`는 "이 가방 안에 어떤 물건이 들어있는지"까지 말하는 것이다.

---

## 10. 오늘 기억할 TypeScript 감각

TypeScript에서는 객체인지 아닌지만 중요한 것이 아니다.

중요한 것은 객체의 모양이다.

```txt
Object
  -> 그냥 객체

{ label: string; disabled: boolean }
  -> label과 disabled를 가진 객체
```

TypeScript를 잘 쓴다는 것은 이런 감각에 익숙해지는 것이다.

```txt
이 값은 객체야
```

에서 멈추지 않고:

```txt
이 값은 어떤 key를 가지고 있고,
각 key의 value는 어떤 타입일까?
```

를 생각하는 것이다.

오늘 본 코드 한 줄에는 여러 개념이 들어 있다.

```tsx
const PreviewComponent = componentRegistry[component.type].preview as ComponentType<
  typeof component.props
>
```

여기에 들어 있는 개념:

```txt
componentRegistry
union type
component.type으로 객체 접근
React ComponentType
generic <>
typeof
as 타입 단언
```

그래서 처음에 어렵게 느껴지는 것이 정상이다.

오늘은 이 정도로만 기억해도 충분하다.

```txt
Object = 그냥 객체라고만 말함
typeof component.props = 이 props의 정확한 모양을 따라감
ComponentType<Props> = Props를 받는 React 컴포넌트 타입
as = TypeScript에게 이 타입으로 봐달라고 말함
```

---

## 11. registry는 TypeScript 전용 개념일까?

아니다.

`registry`는 TypeScript에만 있는 특별한 문법이나 자료형이 아니다.

실제 코드 모양만 보면 그냥 JavaScript 객체다.

```ts
const componentRegistry = {
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

처음 봤을 때 "그냥 상수 객체 아닌가?"라고 느끼는 것이 맞다.

차이는 문법이 아니라 역할이다.

```txt
object
  -> 자료구조 이름

registry
  -> 그 object가 맡고 있는 역할 이름
```

registry는 보통 어떤 key를 실제 구현이나 설정에 연결해주는 등록표 역할을 한다.

```txt
어떤 이름 / 타입 / key가 들어온다
  -> 그 key에 맞는 컴포넌트, 함수, 설정을 찾는다
```

현재 프로젝트에서는 이런 흐름이다.

```txt
component.type = 'Button'
  -> componentRegistry.Button
  -> ButtonPreview
```

즉 `componentRegistry`는 컴포넌트 타입과 preview 컴포넌트를 연결하는 등록표다.

---

## 12. registry라는 표현은 많이 쓸까?

많이 쓴다.

특히 아래처럼 key와 실제 구현을 연결할 때 자주 쓴다.

```ts
const componentRegistry = {
  Button: ButtonPreview,
  Card: CardPreview,
}
```

```ts
const commandRegistry = {
  copy: copyCommand,
  paste: pasteCommand,
  undo: undoCommand,
}
```

```ts
const fieldRegistry = {
  text: TextField,
  select: SelectField,
  checkbox: CheckboxField,
}
```

```ts
const pluginRegistry = {
  markdown: markdownPlugin,
  imageUpload: imageUploadPlugin,
}
```

프론트엔드에서는 이런 곳에서 자주 볼 수 있다.

```txt
컴포넌트 에디터
폼 빌더
노코드/로우코드 툴
대시보드 위젯
라우팅/페이지 매핑
아이콘 매핑
플러그인 시스템
명령 팔레트
```

즉 registry는 특별한 문법 이름이 아니라, 설계 의도를 드러내는 표현이다.

```txt
이 객체는 단순히 값을 모아둔 것이 아니라
key로 구현을 찾아주는 중앙 등록소 역할을 한다.
```

포트폴리오에서는 이렇게 표현할 수 있다.

```txt
componentRegistry를 도입해 컴포넌트 타입과 preview 렌더러를 분리했습니다.
```

조금 더 자세히 쓰면:

```txt
컴포넌트 타입별 preview 렌더링 로직을 switch문에서 분리하고,
componentRegistry 기반으로 중앙 관리하도록 구조화했습니다.
이를 통해 추후 defaultProps, propsSchema 등을 registry에 확장할 수 있는 기반을 마련했습니다.
```

이 표현은 꽤 자연스럽고 실무적인 설명이다.

---

## 13. 오늘 변경한 파일

새로 만든 파일:

```txt
src/registry/componentRegistry.ts
src/components/inspector/TextField.tsx
src/components/inspector/SelectField.tsx
src/components/inspector/CheckboxField.tsx
```

수정한 파일:

```txt
src/components/PreviewPane.tsx
src/components/InspectorPane.tsx
```

확인한 명령어:

```bash
npm run build
npm run lint
```

둘 다 통과했다.
