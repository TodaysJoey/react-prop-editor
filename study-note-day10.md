# Day 10 Study Note: 타입스크립트의 정적 타입과 동적 인덱싱 (`as Record<string, PropValue>`의 필요성)

## 오늘의 목표

열째 날의 핵심은 에디터의 `InspectorPane` 컴포넌트에서 발견한 다음 타입스크립트 코드의 깊은 동작 원리를 이해하는 것이다.

```typescript
const props = component.props as Record<string, PropValue>
```

바닐라 자바스크립트에서는 매우 당연하게 여겨지는 **"객체의 키값에 문자열로 접근해서 값을 가져오는 행위"**가, 왜 타입스크립트에서는 명시적인 타입 지정을 요구하는지 그 아키텍처적 배경과 원리를 정리한다.

---

## 1. 바닐라 JS vs TypeScript: 객체 모델의 차이

자바스크립트와 타입스크립트는 객체를 바라보는 기본 철학이 다르다.

### 바닐라 자바스크립트 (Dynamic Bag of Properties)
* 자바스크립트에서 객체는 단순히 키(Key)와 값(Value)의 집합체(Hash Map)일 뿐이다.
* 언제든지 동적으로 새로운 키를 추가할 수 있고, 어떤 문자열로든 객체의 속성에 접근할 수 있다.
* 존재하지 않는 키에 접근하면 런타임에 에러가 나는 대신 `undefined`를 반환하므로 유연하지만, 런타임 버그의 원인이 되기 쉽다.

### 타입스크립트 (Statically Typed Structure)
* 타입스크립트에서 객체는 **"정적으로 정의된 구조체(Structure)"**다.
* 선언되지 않은 속성에 임의로 접근하거나 값을 넣는 행위를 기본적으로 차단한다.
* 안전성이 보장되지 않는 동적 인덱싱(Dynamic Indexing)에 대해 컴파일 시점에 경고를 보낸다.

---

## 2. 왜 `component.props`에 바로 동적 접근을 할 수 없을까?

현재 프로젝트의 [`editor.ts`](file:///Users/jihyun/Desktop/workspace/react-prop-editor/src/types/editor.ts)에서 컴포넌트의 타입들은 아래와 같이 유니온 타입으로 묶여 있다.

```typescript
export type ComponentPropsMap = {
  Button: ButtonProps  // { label: string; variant: 'primary' | 'secondary'; disabled: boolean }
  Card: CardProps      // { title: string; description: string }
  Input: InputProps    // { placeholder: string; disabled: boolean }
}
```

이 상태에서 `component.props`는 `ButtonProps | CardProps | InputProps` 형태를 가지게 된다.

만약 우리가 `InspectorPane`에서 동적으로 특정 속성 이름을 담은 변수 `propName: string`을 사용해 값에 접근하려고 하면 에러가 발생한다.

```typescript
const propName: string = "label";

// ❌ TypeScript 컴파일 에러 발생!
// "Element implicitly has an 'any' type because expression of type 'string' can't be used to index type..."
const value = component.props[propName];
```

### 타입스크립트가 에러를 내는 이유:
1. **공통되지 않은 프로퍼티:** `label`은 `ButtonProps`에는 있지만 `CardProps`에는 없다. 타입스크립트는 현재 선택된 컴포넌트가 `Card`일 수도 있으므로, 존재하지 않는 속성에 접근하는 위험한 코드라고 판단한다.
2. **인덱스 시그니처(Index Signature)의 부재:** `ButtonProps` 등은 명확히 정해진 고정 키(`label`, `variant`, `disabled`)만 가지며, 임의의 무작위 문자열(`string`)로 조회할 수 있는 사전(Map) 형태가 아니기 때문이다.

---

## 3. `as Record<string, PropValue>`의 역할 (타입 단언)

이 문제를 해결하기 위해 `InspectorPane`에서는 다음과 같이 타입을 단언(Type Assertion)해 준다.

```typescript
const props = component.props as Record<string, PropValue>
```

### 무엇을 의미하는가?
* `Record<string, PropValue>`는 **"키는 어떤 문자열(`string`)이든 올 수 있고, 값은 `PropValue`(`string | boolean`)인 객체"**를 의미한다.
* `as` 문법(타입 단언)을 사용해 타입스크립트에게 다음과 같이 선언하는 것이다.
  > *"지금 다루는 `component.props`가 특정 컴포넌트의 고정된 형태를 갖고 있다는 건 알아. 하지만 지금만큼은 이 객체를 **동적으로 자유롭게 조회할 수 있는 Key-Value 사전(Dictionary)**으로 간주해줘."*

이 단언 덕분에 타입스크립트 컴파일러는 `props[propName]`과 같이 동적인 문자열 키로 안전하게 값에 접근하는 것을 허용하게 된다.

---

## 4. 타입 단언 없이 해결하는 대안과 한계

타입스크립트에서 안전하게 단언(`as`) 없이 코드를 작성하는 정석적인 방법은 **타입 좁히기(Type Narrowing)**다.

```typescript
if (component.type === 'Button') {
  // 컴포넌트가 Button임이 확실하므로 props는 ButtonProps로 자동 추론된다.
  const label = component.props.label; // 100% 안전하게 자동완성 
} else if (component.type === 'Card') {
  const title = component.props.title;
}
```

### 왜 이 대안을 사용하지 않았을까?
우리 에디터의 `InspectorPane`은 모든 컴포넌트의 속성을 공통적이고 동적으로 렌더링하기 위한 **제네릭/동적(Dynamic) 뷰**다.
* 만약 위와 같이 하드코딩 분기 처리를 한다면, 새로운 컴포넌트가 추가될 때마다 `InspectorPane` 코드도 매번 수정해야 하므로 확장성이 극도로 떨어진다.
* `propsSchema`를 순회하면서 동적으로 필드를 만드는 **Schema-driven 아키텍처**를 유지하기 위해서는 어쩔 수 없이 타입을 유연하게 다룰 수밖에 없고, 이를 위한 가장 깔끔한 절충안이 `as Record<string, PropValue>`인 것이다.

---

## 5. 오늘의 배움: 엄격함(Strictness)과 유연성(Flexibility)의 균형

* **타입스크립트는 정적 검사기이다:** 런타임에 발생할 수 있는 잠재적 위험(존재하지 않는 키 접근 등)을 정적으로 다 차단하려고 하기 때문에 동적 접근이 까다롭다.
* **실무적 타협이 필요하다:** 모든 곳에서 100% 엄격한 타입만 고집하면 dynamic UI, generic form과 같은 유연한 설계를 할 때 불필요하게 코드가 길어지거나 하드코딩이 늘어난다.
* **타입 단언(`as`)의 올바른 사용:** 무분별한 `as any`는 타입 시스템을 파괴하지만, 안전한 범위 내에서 타입을 유연하게 넓혀주는 `as Record<string, PropValue>` 같은 단언은 생산성과 아키텍처적 유연성을 위해 권장되는 훌륭한 도구다.
