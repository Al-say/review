---
title: React Hooks 最佳实践
topic: 前端开发
tags: react, hooks, javascript
updated: 2026-01-27
---

# React Hooks 最佳实践

React Hooks 是 React 16.8 引入的新特性，让函数组件也能拥有状态和生命周期。本文总结了使用 Hooks 时的最佳实践。

## 1. 使用 ESLint 插件

```bash
npm install eslint-plugin-react-hooks --save-dev
```

在 `.eslintrc.js` 中配置：

```javascript
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## 2. 自定义 Hooks

将可复用的逻辑提取到自定义 Hooks 中：

```javascript
// useLocalStorage.js
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
```

## 3. useEffect 依赖管理

### ✅ 正确做法
```javascript
useEffect(() => {
  const subscription = props.source.subscribe();
  return () => {
    subscription.unsubscribe();
  };
}, [props.source]); // 包含所有依赖
```

### ❌ 错误做法
```javascript
useEffect(() => {
  const subscription = props.source.subscribe();
  return () => {
    subscription.unsubscribe();
  };
}, []); // 缺少依赖，可能导致 bug
```

## 4. useCallback 和 useMemo

### 性能优化
```javascript
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);

const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

### 避免过度使用
只有在必要时才使用 `useCallback` 和 `useMemo`，过度的优化可能适得其反。

## 5. Hooks 规则

### ✅ 只能在 React 函数中调用
```javascript
function MyComponent() {
  const [count, setCount] = useState(0); // ✅
  return <div>{count}</div>;
}
```

### ❌ 不要在循环、条件或嵌套函数中调用
```javascript
if (condition) {
  const [count, setCount] = useState(0); // ❌
}
```

## 6. useReducer vs useState

### 使用 useReducer 的场景
- 复杂的状态逻辑
- 多个子组件共享状态
- 下一个状态依赖于前一个状态

```javascript
const [state, dispatch] = useReducer(reducer, initialState);
```

## 7. 自定义 Hooks 命名约定

以 `use` 开头：

```javascript
function useWindowSize() {
  // ...
}

function useDebounce(value, delay) {
  // ...
}
```

## 8. 错误处理

```javascript
function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(() => {
    setStatus('pending');
    setValue(null);
    setError(null);

    return asyncFunction()
      .then((response) => {
        setValue(response);
        setStatus('success');
      })
      .catch((error) => {
        setError(error);
        setStatus('error');
      });
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
}
```

## 9. 测试 Hooks

使用 `@testing-library/react-hooks`：

```javascript
import { renderHook, act } from '@testing-library/react-hooks';

test('should increment counter', () => {
  const { result } = renderHook(() => useCounter());

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

## 10. 常见陷阱

### 陷阱 1: 依赖数组不完整
```javascript
useEffect(() => {
  fetchUser(userId); // userId 没有在依赖中
}, []); // ❌
```

### 陷阱 2: 直接修改状态
```javascript
const [todos, setTodos] = useState([]);

const addTodo = (todo) => {
  todos.push(todo); // ❌ 直接修改
  setTodos(todos);
};
```

### 陷阱 3: 条件调用 Hooks
```javascript
if (user) {
  const [name, setName] = useState(''); // ❌
}
```

## 总结

React Hooks 让函数组件更加强大，但需要遵循规则和最佳实践。记住：

1. 只在顶层调用 Hooks
2. 只在 React 函数中调用 Hooks
3. 正确管理依赖
4. 使用自定义 Hooks 提高复用性
5. 编写测试确保可靠性

通过遵循这些实践，你可以写出更健壮、更易维护的 React 应用。

#react #hooks #javascript #frontend