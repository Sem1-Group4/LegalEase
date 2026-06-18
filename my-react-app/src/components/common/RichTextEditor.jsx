import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import api from "../../api/axios";

// Thanh công cụ: tiêu đề, đậm/nghiêng/gạch, danh sách, link, ẢNH, xóa định dạng
const TOOLBAR = [
  [{ header: [2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "image"],
  ["clean"],
];

export default function RichTextEditor({ value, onChange, placeholder }) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Khởi tạo Quill 1 lần duy nhất
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (quillRef.current) return;

    container.innerHTML = "";
    const editor = document.createElement("div");
    container.appendChild(editor);

    const quill = new Quill(editor, {
      theme: "snow",
      placeholder: placeholder || "Nhập nội dung…",
      modules: {
        toolbar: {
          container: TOOLBAR,
          handlers: {
            // Khi bấm nút ảnh: mở chọn file -> upload -> chèn URL
            image: () => imageHandler(quill),
          },
        },
      },
    });
    quillRef.current = quill;

    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }

    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      onChangeRef.current?.(html === "<p><br></p>" ? "" : html);
    });

    return () => {
      quillRef.current = null;
      if (container) container.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đồng bộ value từ ngoài (khi mở form sửa bài khác)
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    const current = quill.root.innerHTML;
    const incoming = value || "";
    if (incoming !== current) {
      if (incoming === "") {
        quill.setText("");
      } else {
        quill.clipboard.dangerouslyPasteHTML(incoming);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <div ref={containerRef} />;
}

// Mở hộp chọn file, upload ảnh lên server, chèn URL vào vị trí con trỏ
function imageHandler(quill) {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    // Giới hạn 2MB (khớp validate backend)
    if (file.size > 2 * 1024 * 1024) {
      alert("Ảnh quá lớn (tối đa 2MB).");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/admin/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data.url;

      // Chèn ảnh tại vị trí con trỏ hiện tại
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", url);
      quill.setSelection(range.index + 1);
    } catch (e) {
      alert(e?.response?.data?.message || "Tải ảnh không thành công.");
    }
  };
}
