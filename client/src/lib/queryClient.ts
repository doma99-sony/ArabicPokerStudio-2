import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errText: string;
    
    try {
      // محاولة تحليل الاستجابة كـ JSON
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errJson = await res.json();
        errText = errJson.message || `Error ${res.status}: ${res.statusText}`;
      } else {
        errText = await res.text() || res.statusText;
      }
      
      // خطأ خاص بالمصادقة - تنظيف التخزين المحلي
      if (res.status === 401) {
        console.log("خطأ مصادقة من الخادم:", errText);
        localStorage.removeItem("lastAuthTimestamp");
        
        // لا نقوم بإعادة التوجيه هنا، نترك ذلك للمكونات
      }
    } catch (e) {
      errText = `Error ${res.status}: ${res.statusText}`;
    }
    
    throw new Error(`${res.status}: ${errText}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      // منع استخدام الكاش للاستعلامات المتعلقة بالمستخدم
      cache: queryKey[0] === '/api/user' ? 'no-store' : 'default',
      // استخدام هيدر إضافي لمنع الكاش
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      // تسجيل حدث 401 في التخزين المحلي
      if (queryKey[0] === '/api/user') {
        console.log("المستخدم غير مسجل دخوله، تم إرجاع 'null' بدلاً من رمي خطأ");
        localStorage.removeItem("lastAuthTimestamp");
      }
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
