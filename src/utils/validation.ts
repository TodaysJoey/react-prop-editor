import { componentRegistry } from '../registry/componentRegistry'
import type { EditorNode, ComponentType } from '../types/editor'

export type ValidationResult =
  | {
      success: true
      data: {
        components: EditorNode[]
        selectedComponentId: string
      }
    }
  | {
      success: false
      error: string
    }

export function validateEditorState(jsonStr: string): ValidationResult {
  if (!jsonStr.trim()) {
    return { success: false, error: '입력된 내용이 없습니다.' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    return { success: false, error: '올바른 JSON 형식이 아닙니다. 문법을 확인해주세요.' }
  }

  let components: unknown[]
  let selectedComponentId = ''

  // 1. 데이터 구조 최상위 랩핑 체크 (배열 형태와 { components, selectedComponentId } 형태 모두 지원)
  if (Array.isArray(parsed)) {
    components = parsed
  } else if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>
    if (!Array.isArray(obj.components)) {
      return {
        success: false,
        error: 'JSON 객체 내부에 "components" 배열 필드가 존재해야 합니다.',
      }
    }
    components = obj.components
    selectedComponentId = typeof obj.selectedComponentId === 'string' ? obj.selectedComponentId : ''
  } else {
    return { success: false, error: '가져온 데이터의 최상위 구조가 올바르지 않습니다.' }
  }

  if (components.length === 0) {
    return { success: false, error: '가져올 컴포넌트 데이터가 비어 있습니다.' }
  }

  const validatedComponents: EditorNode[] = []

  // 2. 개별 컴포넌트 노드 검증
  for (let i = 0; i < components.length; i++) {
    const item = components[i]
    const indexStr = `[${i}번째 컴포넌트]`

    if (!item || typeof item !== 'object') {
      return { success: false, error: `${indexStr} 객체 형식이어야 합니다.` }
    }

    const itemObj = item as Record<string, unknown>

    if (typeof itemObj.id !== 'string' || !itemObj.id.trim()) {
      return { success: false, error: `${indexStr} 유효한 "id" (문자열) 필드가 필요합니다.` }
    }

    const type = itemObj.type as ComponentType
    const validTypes = Object.keys(componentRegistry) as ComponentType[]
    if (!validTypes.includes(type)) {
      return {
        success: false,
        error: `${indexStr} 지원하지 않는 컴포넌트 타입입니다: "${type}" (허용 타입: ${validTypes.join(', ')})`,
      }
    }

    // props 검증 및 기본값 병합
    const props = itemObj.props
    if (props !== undefined && (typeof props !== 'object' || props === null)) {
      return { success: false, error: `${indexStr} "props"는 객체 형식이어야 합니다.` }
    }

    const registryItem = componentRegistry[type]
    const mergedProps = { ...registryItem.defaultProps } as Record<string, unknown>
    const inputProps = (props as Record<string, unknown>) || {}

    // schema 기반 타입 체크
    const schema = registryItem.propsSchema as Record<
      string,
      { type: string; options?: readonly string[] }
    >
    for (const [propName, propSchema] of Object.entries(schema)) {
      const val = inputProps[propName]

      if (val !== undefined) {
        if (propSchema.type === 'boolean') {
          if (typeof val !== 'boolean') {
            return {
              success: false,
              error: `${indexStr}의 "${propName}" 속성은 boolean 타입이어야 합니다.`,
            }
          }
          mergedProps[propName] = val
        } else if (propSchema.type === 'text') {
          if (typeof val !== 'string') {
            return {
              success: false,
              error: `${indexStr}의 "${propName}" 속성은 문자열 타입이어야 합니다.`,
            }
          }
          mergedProps[propName] = val
        } else if (propSchema.type === 'select') {
          if (typeof val !== 'string' || !propSchema.options || !propSchema.options.includes(val)) {
            return {
              success: false,
              error: `${indexStr}의 "${propName}" 속성은 다음 중 하나여야 합니다: ${propSchema.options?.join(', ')} (입력값: "${val}")`,
            }
          }
          mergedProps[propName] = val
        }
      }
    }

    validatedComponents.push({
      id: itemObj.id as string,
      type,
      props: mergedProps,
    } as unknown as EditorNode)
  }

  // 3. selectedComponentId 결정 및 유효성 검사
  const exists = validatedComponents.some((c) => c.id === selectedComponentId)
  if (!exists) {
    selectedComponentId = validatedComponents[0].id
  }

  return {
    success: true,
    data: {
      components: validatedComponents,
      selectedComponentId,
    },
  }
}
