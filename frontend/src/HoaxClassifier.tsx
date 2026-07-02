import { Upload } from "lucide-react";
import { useRef, type FormEvent } from "react";

export function HoaxClassifier() {
  const base_url = "http://127.0.0.1:8000";
  const responseRef = useRef<HTMLFormElement>(null);
  const sendText = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const text = formData.get("title") as string;
      const url = `${base_url}/predict_word`;
      const res = await fetch(url, { method: "POST", body: text });

      const data = await res.json();
      responseRef.current!.value = JSON.stringify(data, null, 2);
    } catch (error) {
      responseRef.current!.value = String(error);
    }
  };

  const sendImage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const file = formData.get("image") as File;
      console.log(file);
      formData.append("file", file);
      console.log(formData);
      const url = `${base_url}/predict_pict`;
      const res = await fetch(url, { method: "POST", body: formData });

      const data = await res.json();
      responseRef.current!.value = JSON.stringify(data, null, 2);
    } catch (error) {
      responseRef.current!.value = String(error);
    }
  };

  return (
    <div className="mt-8 mx-auto w-full max-w-2xl text-left flex flex-col gap-4">
      <form
        onSubmit={sendText}
        className="items-center gap-2 bg-[#1a1a1a] p-3 rounded-xl font-mono border-2 border-[#fbf0df] transition-colors duration-300 focus-within:border-[#f3d5a3] w-full"
      >
        <textarea
          name="title"
          className="w-full flex-1 bg-transparent border-0 text-[#fbf0df] font-mono text-base py-1.5 px-2 outline-none focus:text-white placeholder-[#fbf0df]/40"
          placeholder="input text"
        />
        <button
          type="submit"
          className="flex text-center item-center gap-2 bg-[#fbf0df] p-3 rounded-xl text-[#1a1a1a] font-mono w-full"
        >
          Send
        </button>
      </form>
      <form
        onSubmit={sendImage}
        className="items-center gap-y-2 bg-[#1a1a1a] p-3 rounded-xl font-mono border-2 border-[#fbf0df] transition-colors duration-300 focus-within:border-[#f3d5a3] w-full h-full "
        encType="multipart/form-data"
      >
        <div className="text-center justify-center place-items-center w-full rounded-xl border-2 p-2 relative cursor-pointer mb-2">
          <Upload className="size-9 m-5" />
          <h3>Click for Upload</h3>
          <p>No more than 10 mb</p>
          <input
            type="file"
            className="block h-full w-full absolute cursor-pointer top-5 opacity-0"
            name="image"
          />
        </div>
        <button
          type="submit"
          className="flex item-center gap-2 bg-[#fbf0df] p-3 rounded-xl text-[#1a1a1a] font-mono w-full mt-2"
        >
          Send
        </button>
      </form>
      <textarea
        ref={responseRef}
        readOnly
        placeholder="Response will appear here..."
        className="w-full min-h-35 bg-[#1a1a1a] border-2 border-[#fbf0df] rounded-xl p-3 text-[#fbf0df] font-mono resize-y focus:border-[#f3d5a3] placeholder-[#fbf0df]/40"
      />
    </div>
  );
}
