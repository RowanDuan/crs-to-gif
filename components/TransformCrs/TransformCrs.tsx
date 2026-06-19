"use client";

import { useEffect, useState } from "react";
import {
  ClearOutlined,
  LoadingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Image, message, Spin, Upload } from "antd";
import type { UploadProps } from "antd";

import LiquidGlassButton from "@/components/LiquidGlassButton/LiquidGlassButton";

import {
  crsToGifBlob,
  downloadBlob,
  parseCrs,
  type CrsAnimInfo,
} from "@/lib/crsToGif";

const MAX_FILES = 5;

type ConvertedItem = {
  uid: string;
  fileName: string;
  gifUrl: string;
  animInfo: CrsAnimInfo;
};

export default function TransformCrs() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ConvertedItem[]>([]);

  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.gifUrl));
    };
  }, [items]);

  const convertFiles = async (files: File[]) => {
    if (files.length > MAX_FILES) {
      message.error(`最多同时转换 ${MAX_FILES} 个文件`);
      return;
    }

    setLoading(true);
    setItems((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.gifUrl));
      return [];
    });

    const results: ConvertedItem[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer();
        const { info } = parseCrs(buffer);
        const gifBlob = crsToGifBlob(buffer);
        const url = URL.createObjectURL(gifBlob);
        results.push({
          uid: `${file.name}-${crypto.randomUUID()}`,
          fileName: file.name.replace(/\.crs$/i, ""),
          gifUrl: url,
          animInfo: info,
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : "转换失败";
        errors.push(`${file.name}: ${msg}`);
      }
    }

    setItems(results);

    if (results.length > 0) {
      message.success(`成功转换 ${results.length} 个文件`);
    }
    if (errors.length > 0) {
      message.error(errors.join("；"));
    }

    setLoading(false);
  };

  const handleClear = () => {
    setItems((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.gifUrl));
      return [];
    });
  };

  const handleBeforeUpload: UploadProps["beforeUpload"] = (file, fileList) => {
    if (fileList.length > MAX_FILES) {
      if (file.uid === fileList[0]?.uid) {
        message.error(`最多同时转换 ${MAX_FILES} 个文件`);
      }
      return Upload.LIST_IGNORE;
    }

    const isLast = fileList[fileList.length - 1]?.uid === file.uid;
    if (!isLast) return false;

    void convertFiles([...fileList]);
    return false;
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-zinc-900">CRS 转 GIF</h3>

      <p className="text-sm text-[#000]">
        一次最多上传 {MAX_FILES} 个 Matrix
        键盘动画文件（.crs），将自动解析并转换为 GIF。
      </p>

      <div className="flex flex-row items-center gap-2">
        <Upload
          accept=".crs"
          multiple
          maxCount={MAX_FILES}
          showUploadList={false}
          beforeUpload={handleBeforeUpload}
        >
          <LiquidGlassButton
            icon={<UploadOutlined />}
            // loading={loading}
            disabled={loading}
          >
            选择 CRS 文件（最多 {MAX_FILES} 个）
          </LiquidGlassButton>
        </Upload>
        <LiquidGlassButton
          icon={<ClearOutlined />}
          disabled={loading || items.length === 0}
          onClick={handleClear}
        >
          清空
        </LiquidGlassButton>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-white">
          <Spin
            size="small"
            indicator={
              <LoadingOutlined style={{ color: "#fff", fontSize: 14 }} spin />
            }
          />
          <span>正在转换，帧数较多时请稍候…</span>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="flex flex-row gap-4">
          {items.map((item) => {
            const handleDownload = () => {
              fetch(item.gifUrl)
                .then((r) => r.blob())
                .then((blob) => downloadBlob(blob, `${item.fileName}.gif`));
            };

            return (
              <div key={item.uid} className="flex flex-col gap-2">
                <Image
                  src={item.gifUrl}
                  alt={`${item.fileName}.gif`}
                  width={128}
                  preview={{ mask: "预览" }}
                />
                <p className="text-sm text-[#000]">
                  {item.animInfo.magic} {item.animInfo.width}×
                  {item.animInfo.height} · {item.animInfo.frameCount} 帧
                </p>
                <span
                  role="button"
                  tabIndex={0}
                  className="transform-crs-download"
                  onClick={handleDownload}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    handleDownload();
                  }}
                >
                  下载 {item.fileName}.gif
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
