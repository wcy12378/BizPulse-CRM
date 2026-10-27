"use client";
import { Component, type ReactNode } from "react";
import { useT } from "@/lib/i18n/IdiomaProvider";

class Boundary extends Component<
  { children: ReactNode; message: string; retry: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div role="alert" className="rounded-xl border p-6">
          <p>{this.props.message}</p>
          <button className="mt-4 underline" onClick={() => this.setState({ failed: false })}>
            {this.props.retry}
          </button>
        </div>
      );
    return this.props.children;
  }
}
export function OfflineBoundary({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <Boundary message={t("此演示模块暂不可用，本地数据已保留。")} retry={t("重试模块")}>
      {children}
    </Boundary>
  );
}
