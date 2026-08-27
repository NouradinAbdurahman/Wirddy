import { ImageResponse } from "next/og"
import { getGroupByPublicId } from "@/lib/groups/service"

export const runtime = "nodejs"
export const alt = "Wirddy - Quran Reading Plan"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image({
  params,
}: {
  params: Promise<{ publicId: string }>
}) {
  const { publicId } = await params
  const group = await getGroupByPublicId(publicId)

  const groupName = group?.groupName || "ختمة القرآن"
  const weeksCount = group?.schedule.weeksCount || 4
  const membersCount = group?.membersConfig.length || 0

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#030712",
        color: "#f8fafc",
        padding: "60px 80px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient Glows */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          backgroundColor: "rgba(13, 148, 136, 0.25)",
          filter: "blur(120px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          left: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          filter: "blur(100px)",
        }}
      />

      {/* Top Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "#0d9488",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "26px",
              fontWeight: 900,
            }}
          >
            و
          </div>
          <span
            style={{
              fontSize: "32px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "#ffffff",
            }}
          >
            وِردي
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 20px",
            borderRadius: "100px",
            backgroundColor: "rgba(13, 148, 136, 0.2)",
            border: "1px solid rgba(13, 148, 136, 0.4)",
            color: "#2dd4bf",
            fontSize: "18px",
            fontWeight: 700,
          }}
        >
          خطة ختمة القرآن الكريم
        </div>
      </div>

      {/* Middle Group Showcase */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#94a3b8",
          }}
        >
          جدول تنظيم القراءة الأسبوعي
        </span>
        <div
          style={{
            fontSize: "64px",
            fontWeight: 900,
            lineHeight: 1.1,
            color: "#ffffff",
          }}
        >
          {groupName}
        </div>
      </div>

      {/* Bottom Badges */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 24px",
            borderRadius: "16px",
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            fontSize: "20px",
            fontWeight: 700,
            color: "#f8fafc",
          }}
        >
          {weeksCount} أسابيع
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 24px",
            borderRadius: "16px",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            fontSize: "20px",
            fontWeight: 700,
            color: "#34d399",
          }}
        >
          ٣٠ جزءًا أسبوعيًا
        </div>

        {membersCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              borderRadius: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              fontSize: "20px",
              fontWeight: 700,
              color: "#f8fafc",
            }}
          >
            {membersCount} أعضاء
          </div>
        )}
      </div>
    </div>,
    {
      ...size,
    }
  )
}
