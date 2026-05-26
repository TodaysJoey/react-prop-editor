# Day 9 Study Note: propsSchema와 조건부 타입 이해하기

## 오늘의 목표

아홉째 날의 핵심은 `componentRegistry`에 `propsSchema`를 추가하고, Inspector가 이 schema를 보고 입력 UI를 만들도록 바꾸는 것이다.

오늘 한 일은 크게 두 가지다.

```txt
1. Button, Card, Input에 propsSchema를 추가했다.
2. TypeScript 조건부 타입, never, [T] extends [X] 패턴을 공부했다.
```

이번 작업은 기능 자체보다 방향이 중요하다.

기존에는 `InspectorPane`이 컴포넌트별 props 편집 UI를 직접 알고 있었다.

```txt
Button이면 TextField, SelectField, CheckboxField를 직접 렌더링한다.
Card이면 TextField 두 개를 직접 렌더링한다.
Input이면 TextField, CheckboxField를 직접 렌더링한다.
```

이제는 `componentRegistry`에 있는 `propsSchema`를 보고 어떤 입력 UI를 만들지 결정한다.

```txt
propsSchema.type이 text이면 TextField
propsSchema.type이 select이면 SelectField
propsSchema.type이 boolean이면 CheckboxField
```

즉 Inspector의 지식을 registry로 옮기기 시작한 것이다.

---

## 1. propsSchema는 무엇인가?

`propsSchema`는 실제 props 값이 아니다.

props를 어떤 입력 UI로 편집할지 설명하는 설정이다.

예를 들어 Button의 실제 props는 다음과 같다.

```ts
type ButtonProps = {
  label: string
  variant: 'primary' | 'secondary'
  disabled: boolean
}
```

여기에 대응하는 schema는 다음과 같다.

```ts
propsSchema: {
  label: {
    type: 'text',
    label: 'Label',
  },
  variant: {
    type: 'select',
    label: 'Variant',
    options: ['primary', 'secondary'],
  },
  disabled: {
    type: 'boolean',
    label: 'Disabled',
  },
}
```

뜻은 다음과 같다.

```txt
label
  -> 문자열이므로 TextField로 편집한다.

variant
  -> 정해진 선택지 중 하나이므로 SelectField로 편집한다.

disabled
  -> true/false 값이므로 CheckboxField로 편집한다.
```

`defaultProps`가 "처음 생성할 실제 값"이라면, `propsSchema`는 "그 값을 어떻게 편집할지에 대한 설명"이다.

---

## 2. schema-driven이란?

기존 방식은 하드코딩에 가깝다.

```tsx
if (component.type === 'Button') {
  return (
    <>
      <TextField label="label" />
      <SelectField label="variant" />
      <CheckboxField label="disabled" />
    </>
  )
}
```

이 방식에서는 `InspectorPane`이 Button의 props 구조를 직접 알고 있다.

schema-driven 방식은 다르다.

```txt
1. 현재 선택된 컴포넌트의 propsSchema를 가져온다.
2. schema 항목들을 순회한다.
3. schema.type에 따라 알맞은 Field 컴포넌트를 렌더링한다.
```

이렇게 하면 나중에 새 컴포넌트를 추가할 때 `InspectorPane`에 필드를 계속 직접 추가하지 않아도 된다.

목표는 다음 방향이다.

```txt
새 컴포넌트 추가
  -> registry에 preview, defaultProps, propsSchema 등록
  -> Inspector는 schema를 보고 자동으로 입력 UI 생성
```

아키텍처적으로 표현하면 다음과 같다.

```txt
UI 렌더링 규칙을 코드 분기에서 데이터 스키마로 이동시킨 구조
```

`schema-driven`은 꽤 보편적으로 쓰는 표현이다.

특히 폼, 에디터, CMS, admin tool, API validation, design system 쪽에서 자주 나온다.

비슷한 표현도 있다.

```txt
schema-driven UI
configuration-driven UI
metadata-driven UI
declarative rendering
data-driven rendering
```

다만 뉘앙스는 조금씩 다르다.

```txt
schema-driven
  -> 데이터 구조나 필드 구조를 설명하는 schema를 기반으로 UI를 만든다는 느낌이 강하다.

configuration-driven
  -> schema보다 더 넓은 표현이다. 설정값을 기반으로 동작을 바꾸는 구조까지 포함한다.

data-driven
  -> 가장 넓은 표현이다. 데이터에 따라 화면이 달라진다는 뜻이다.
```

지금 프로젝트에서는 `schema-driven inspector`라는 표현이 잘 맞는다.

`propsSchema`가 단순 데이터가 아니라 다음 정보를 설명하기 때문이다.

```txt
이 prop은 어떤 타입인가?
라벨은 무엇인가?
선택지는 무엇인가?
어떤 입력 UI로 편집해야 하는가?
```

한국어로 풀면 다음처럼 이해할 수 있다.

```txt
스키마를 보고 자동으로 편집 UI를 만드는 구조
```

또는:

```txt
컴포넌트 props 편집 방식을 코드에 직접 박지 않고,
registry의 schema에 선언해두는 방식
```

---

## 3. registry는 무엇인가?

`componentRegistry`도 같은 계열의 아키텍처 개념이다.

쉽게 말하면 registry는 등록표다.

현재 프로젝트의 `componentRegistry`는 컴포넌트 타입 이름을 기준으로, 그 컴포넌트에 필요한 정보를 모아둔다.

```txt
Button
  -> 화면에 보여줄 이름(label)
  -> preview 컴포넌트
  -> 기본 props(defaultProps)
  -> propsSchema

Card
  -> label
  -> preview
  -> defaultProps
  -> propsSchema

Input
  -> label
  -> preview
  -> defaultProps
  -> propsSchema
```

즉 코드 곳곳에서 다음처럼 직접 분기하지 않는다.

```ts
if (type === 'Button') {
  // Button 처리
}

if (type === 'Card') {
  // Card 처리
}
```

대신 타입을 key로 사용해 registry에서 필요한 정보를 찾는다.

```ts
componentRegistry[type]
```

아키텍처적으로 보면 registry도 다음 방향이다.

```txt
하드코딩된 분기
  -> 중앙화된 설정/메타데이터
```

`schema-driven`이 "schema를 보고 UI를 만든다"라면, `registry`는 "type을 보고 관련 정보를 찾는다"에 가깝다.

둘을 합치면 현재 구조는 다음 방향으로 가고 있다.

```txt
component.type
  -> componentRegistry에서 설정 찾기
  -> preview로 미리보기 렌더링
  -> defaultProps로 초기값 생성
  -> propsSchema로 inspector 렌더링
```

즉 `componentRegistry`는 점점 컴포넌트 메타데이터의 중심 저장소가 되고 있다.

보편적인 표현으로는 다음과 같은 말도 쓴다.

```txt
registry pattern
metadata registry
component registry
configuration registry
```

이 프로젝트에서는 `componentRegistry`라는 이름이 자연스럽다.

이 에디터가 지원하는 컴포넌트 목록과 그 메타정보를 등록해둔 곳이기 때문이다.

---

## 4. type은 단순한 모양 선언만 하는 것이 아니다

오늘 가장 크게 느낀 부분이다.

처음에는 `type`을 단순히 데이터 형태를 정하는 문법으로 생각하기 쉽다.

```ts
type User = {
  name: string
  age: number
}
```

하지만 TypeScript의 `type`은 타입을 재료로 받아서 새로운 타입을 계산할 수도 있다.

예를 들어:

```ts
type InputType<Value> =
  Value extends boolean
    ? 'checkbox'
    : Value extends string
      ? 'text'
      : 'unknown'
```

이 타입은 실제 값을 검사하는 것이 아니다.

`Value`라는 타입을 보고 결과 타입을 만든다.

```ts
type A = InputType<boolean> // 'checkbox'
type B = InputType<string> // 'text'
type C = InputType<number> // 'unknown'
```

이 예제에서 `'checkbox'`, `'text'`, `'unknown'`은 문자열 값처럼 생겼지만 여기서는 값이 아니라 타입이다.

정확히는 문자열 리터럴 타입이다.

```ts
type A = 'checkbox'
```

이 말은 `A` 타입에는 오직 `'checkbox'`라는 값만 들어올 수 있다는 뜻이다.

```ts
const a: A = 'checkbox' // 가능
const b: A = 'text' // 불가능
```

정리하면 다음과 같다.

```txt
JavaScript 함수
  -> 값을 받아서 값을 반환한다.

TypeScript 제네릭 타입
  -> 타입을 받아서 타입을 반환한다.
```

조건부 타입은 타입 세계의 if문처럼 볼 수 있다.

---

## 5. PropSchemaField<Value> 읽기

오늘 작성한 핵심 타입은 다음과 같다.

```ts
type PropSchemaField<Value> = [Value] extends [boolean]
  ? {
      type: 'boolean'
      label: string
    }
  : [Value] extends [string]
    ?
        | {
            type: 'text'
            label: string
          }
        | {
            type: 'select'
            label: string
            options: readonly Value[]
          }
    : never
```

사람 말로 풀면 다음과 같다.

```txt
Value가 boolean이면
  -> boolean schema만 허용한다.

Value가 string이면
  -> text schema 또는 select schema를 허용한다.

그 외 타입이면
  -> schema를 만들 수 없다.
```

예를 들어:

```ts
type A = PropSchemaField<boolean>
```

결과는 다음과 같다.

```ts
type A = {
  type: 'boolean'
  label: string
}
```

또 다른 예:

```ts
type B = PropSchemaField<string>
```

결과는 다음처럼 유니온 타입이 된다.

```ts
type B =
  | {
      type: 'text'
      label: string
    }
  | {
      type: 'select'
      label: string
      options: readonly string[]
    }
```

즉 string 타입의 prop은 text 입력으로 편집할 수도 있고, select 입력으로 편집할 수도 있다.

---

## 6. string이면 왜 유니온 타입이 되는가?

이 부분:

```ts
[Value] extends [string]
  ?
      | {
          type: 'text'
          label: string
        }
      | {
          type: 'select'
          label: string
          options: readonly Value[]
        }
  : never
```

`Value`가 string 계열이면 결과 타입은 다음 두 가지 중 하나가 된다.

```txt
text schema
또는
select schema
```

그래서 다음 둘 다 가능하다.

```ts
const textSchema: PropSchemaField<string> = {
  type: 'text',
  label: 'Label',
}
```

```ts
const selectSchema: PropSchemaField<string> = {
  type: 'select',
  label: 'Variant',
  options: ['primary', 'secondary'],
}
```

하지만 boolean schema는 불가능하다.

```ts
const wrongSchema: PropSchemaField<string> = {
  type: 'boolean',
  label: 'Disabled',
}
```

`Value`가 string이면 허용되는 schema는 text 또는 select뿐이기 때문이다.

---

## 7. never는 무엇인가?

`never`는 TypeScript에서 불가능한 타입이다.

어떤 값도 `never` 타입에 들어갈 수 없다.

```ts
const a: never = 'hello' // 불가능
const b: never = 123 // 불가능
const c: never = false // 불가능
```

`PropSchemaField`에서 `never`는 다음 의미다.

```txt
boolean도 아니고 string도 아니면,
아직 지원하는 schema가 없으므로 만들 수 없다.
```

예를 들어 나중에 number prop이 생겼다고 하자.

```ts
type SliderProps = {
  value: number
}
```

현재 타입 기준으로는:

```ts
type SliderSchema = PropSchemaField<number>
```

결과가 `never`가 된다.

왜냐하면 아직 number를 어떤 UI로 편집할지 정하지 않았기 때문이다.

```txt
number를 text input으로 받을지
slider로 받을지
stepper로 받을지
range로 받을지
```

아직 규칙이 없으니 TypeScript가 schema 생성을 막는 것이다.

나중에 number를 지원하고 싶으면 조건을 추가하면 된다.

```ts
type PropSchemaField<Value> =
  [Value] extends [boolean]
    ? BooleanSchema
    : [Value] extends [string]
      ? TextSchema | SelectSchema<Value>
      : [Value] extends [number]
        ? NumberSchema
        : never
```

여기서 `never`는 "최후의 기본 타입"이라기보다 "여기까지 왔으면 허용할 타입이 없다"는 안전장치다.

---

## 8. [Value] extends [boolean]은 왜 쓰는가?

처음 보면 이 문법이 가장 낯설다.

```ts
[Value] extends [boolean]
```

그냥 이렇게 쓰면 안 될까?

```ts
Value extends boolean
```

대부분의 경우에는 이렇게 써도 된다.

하지만 `Value`가 유니온 타입일 때 차이가 생긴다.

예를 들어 Button의 variant 타입은 다음과 같다.

```ts
type ButtonVariant = 'primary' | 'secondary'
```

우리가 원하는 select schema의 options 타입은 이것이다.

```ts
readonly ('primary' | 'secondary')[]
```

즉 다음 배열이 가능해야 한다.

```ts
options: ['primary', 'secondary']
```

그런데 조건부 타입을 이렇게 쓰면:

```ts
type PropSchemaField<Value> = Value extends string
  ? {
      type: 'select'
      options: readonly Value[]
    }
  : never
```

TypeScript는 유니온을 통째로 보지 않고 멤버별로 나눠서 검사한다.

```ts
PropSchemaField<'primary' | 'secondary'>
```

를 내부적으로 이런 식으로 계산한다.

```ts
PropSchemaField<'primary'> | PropSchemaField<'secondary'>
```

그래서 결과가 다음처럼 될 수 있다.

```ts
{
  type: 'select'
  options: readonly 'primary'[]
}
|
{
  type: 'select'
  options: readonly 'secondary'[]
}
```

이 타입은 "primary만 들어 있는 배열" 또는 "secondary만 들어 있는 배열"에 가깝다.

우리가 원하는 "primary와 secondary가 함께 들어갈 수 있는 배열"이 아니다.

그래서 다음 코드가 문제가 된다.

```ts
options: ['primary', 'secondary']
```

이 배열은 `readonly 'primary'[]`도 아니고, `readonly 'secondary'[]`도 아니기 때문이다.

그래서 `Value`를 대괄호로 감싼다.

```ts
[Value] extends [string]
```

이렇게 하면 TypeScript가 유니온을 멤버별로 나누지 않고 전체로 검사한다.

```ts
['primary' | 'secondary'] extends [string]
```

결과적으로 우리가 원하는 타입이 나온다.

```ts
{
  type: 'select'
  options: readonly ('primary' | 'secondary')[]
}
```

한 줄로 정리하면:

```txt
Value extends string
  -> 유니온이면 멤버별로 검사할 수 있다.

[Value] extends [string]
  -> 유니온을 통째로 검사한다.
```

이번 코드에서는 `options: ['primary', 'secondary']`를 허용하기 위해 `[Value] extends [string]` 형태가 필요했다.

---

## 9. 조건부 타입은 유니온에 대해 map처럼 동작할 수 있다

TypeScript 조건부 타입은 기본적으로 유니온을 멤버별로 변환할 수 있다.

예를 들어:

```ts
type ToArray<T> = T extends string ? T[] : never
```

여기에 유니온을 넣으면:

```ts
type Result = ToArray<'a' | 'b'>
```

결과는 다음처럼 된다.

```ts
type Result = 'a'[] | 'b'[]
```

즉 `'a' | 'b'` 전체를 배열로 만든 것이 아니라, `'a'`와 `'b'` 각각에 타입 변환을 적용한 뒤 다시 유니온으로 합친 것이다.

이것은 배열의 `map`과 비슷하게 생각할 수 있다.

```txt
'a' | 'b'
  -> 'a'에 적용
  -> 'b'에 적용
  -> 결과를 다시 합침
```

하지만 유니온 전체를 하나로 유지하고 싶을 때도 있다.

그때는 이렇게 쓴다.

```ts
type ToArray<T> = [T] extends [string] ? T[] : never
```

그러면:

```ts
type Result = ToArray<'a' | 'b'>
```

결과는 다음이 된다.

```ts
type Result = ('a' | 'b')[]
```

차이는 다음과 같다.

```ts
'a'[] | 'b'[]
```

```ts
('a' | 'b')[]
```

첫 번째는 "a만 있는 배열 또는 b만 있는 배열"에 가깝다.

두 번째는 "a와 b가 섞일 수 있는 배열"이다.

우리의 `variant.options`에는 두 번째가 필요했다.

---

## 10. 타입을 엄격하게 만들수록 타입 코드도 복잡해진다

오늘 배운 중요한 감각이다.

조건부 타입을 쓰면 매우 엄격한 타입을 만들 수 있다.

예를 들어:

```txt
boolean prop
  -> boolean schema만 허용

string prop
  -> text schema 또는 select schema만 허용

number prop
  -> 아직 지원하지 않으므로 never
```

이렇게 하면 잘못된 schema를 실행 전에 잡을 수 있다.

하지만 그만큼 타입 코드가 복잡해진다.

지원하는 prop 타입이 늘어나면 조건 분기도 늘어난다.

```ts
type PropSchemaField<Value> =
  [Value] extends [boolean]
    ? BooleanSchema
    : [Value] extends [string]
      ? TextSchema | SelectSchema<Value>
      : [Value] extends [number]
        ? NumberSchema
        : never
```

그래서 실무에서는 균형을 잡아야 한다.

```txt
엄격함이 주는 이득이 크면
  -> 조건부 타입을 쓴다.

읽기 어려움이 더 큰 문제가 되면
  -> 단순한 union 타입으로 낮춘다.
```

예를 들어 학습용이나 작은 프로젝트에서는 이렇게 단순하게 갈 수도 있다.

```ts
type PropSchemaField =
  | { type: 'text'; label: string }
  | { type: 'select'; label: string; options: readonly string[] }
  | { type: 'boolean'; label: string }
```

이 방식은 덜 엄격하지만 훨씬 읽기 쉽다.

오늘의 핵심 문장:

```txt
타입을 엄격하게 만들수록 타입 코드도 하나의 로직처럼 복잡해질 수 있다.
그래서 실무에서는 엄격함과 읽기 쉬움 사이의 균형을 잡는다.
```

---

## 11. 나중에 리팩토링할 방향

현재 타입은 한 번에 읽기에는 조금 무겁다.

```ts
type PropSchemaField<Value> = [Value] extends [boolean]
  ? {
      type: 'boolean'
      label: string
    }
  : [Value] extends [string]
    ?
        | {
            type: 'text'
            label: string
          }
        | {
            type: 'select'
            label: string
            options: readonly Value[]
          }
    : never
```

나중에는 schema 타입을 의미 단위로 분리하면 좋다.

```ts
type BooleanSchema = {
  type: 'boolean'
  label: string
}

type TextSchema = {
  type: 'text'
  label: string
}

type SelectSchema<Value extends string> = {
  type: 'select'
  label: string
  options: readonly Value[]
}

type PropSchemaField<Value> =
  [Value] extends [boolean]
    ? BooleanSchema
    : [Value] extends [string]
      ? TextSchema | SelectSchema<Value>
      : never
```

의미는 같지만 읽기가 훨씬 편해진다.

또 `InspectorPane`도 아직 Button, Card, Input 분기마다 schema 순회 코드가 남아 있다.

나중에는 공통 컴포넌트나 함수로 분리할 수 있다.

```tsx
<SchemaFieldRenderer />
```

또는:

```ts
renderSchemaField(...)
```

이렇게 하면 `InspectorPane`은 더 단순해질 수 있다.

```txt
현재 선택된 component를 받는다.
registry에서 propsSchema를 찾는다.
공통 renderer에게 넘긴다.
```

이 방향은 다음 리팩토링 후보로 남겨둔다.

---

## 오늘의 정리

오늘은 단순히 `propsSchema`를 추가한 날이 아니라, TypeScript가 타입을 얼마나 강하게 계산할 수 있는지 처음 제대로 만난 날이다.

핵심은 다음과 같다.

```txt
1. propsSchema는 props 편집 UI를 설명하는 설정이다.
2. schema-driven 구조는 Inspector의 하드코딩을 줄이는 방향이다.
3. type은 데이터 모양만 정하는 것이 아니라 타입을 받아 새 타입을 계산할 수 있다.
4. 조건부 타입은 타입 세계의 if문처럼 볼 수 있다.
5. never는 불가능한 타입이며, 지원하지 않는 케이스를 막는 안전장치가 된다.
6. [T] extends [X]는 유니온을 쪼개지 않고 통째로 검사하고 싶을 때 쓰는 패턴이다.
7. 타입을 엄격하게 만들수록 타입 코드도 복잡해지므로 균형이 필요하다.
```

아직 한 번에 완전히 익숙해질 필요는 없다.

지금은 다음 정도만 기억해도 충분하다.

```txt
조건부 타입은 타입을 보고 다른 타입을 만들어내는 도구다.
[T] extends [X]는 유니온을 통째로 보고 싶을 때 쓰는 패턴이다.
never는 "이 경우는 허용하지 않겠다"는 의미로 자주 쓰인다.
```
