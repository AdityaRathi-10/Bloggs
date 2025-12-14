"use client";

import FroalaEditor from "react-froala-wysiwyg";
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/js/plugins/image.min.js";
import "froala-editor/js/plugins/char_counter.min.js";
import "froala-editor/js/plugins/save.min.js";
import "froala-editor/js/plugins/markdown.min.js";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios"
import { APIResponse } from "@/utils/ApiResponse";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { tags } from "@/lib/tags.json"

export default function CreatePostPage() {

  const [titleAlert, setTitleAlert] = useState("");
  const [descriptionAlert, setDescriptionAlert] = useState("");
  const [fileName, setFileName] = useState("No files chosen");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [titleModel, setTitleModel] = useState(() => {
    if (typeof window !== "undefined") {
      const storedPost = localStorage.getItem("postTitle");
      if (storedPost) return storedPost;
    }
    return "";
  });
  const [descriptionModel, setDescriptionModel] = useState(() => {
    if (typeof window !== "undefined") {
      const storedPost = localStorage.getItem("postDescription");
      if (storedPost) return storedPost;
    }
    return "";
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [postTags, setPostTags] = useState<string[]>(tags)
  const [editorHeight, setEditorHeight] = useState<null | string>(null);
  const [openTagsMenu, setOpenTagsMenu] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [tagsAdded, setAddedTags] = useState<string[]>([])
  const editPostId = useSearchParams().get("edit")

  useEffect(() => {
    const values = tags.filter((tag) => tag.toLowerCase().includes(inputValue.toLowerCase()))
    setPostTags(values)
  }, [inputValue])

  useEffect(() => {
    const fileName = window.localStorage.getItem("fileName");
    const filePath = window.localStorage.getItem("filePath");
    if (fileName && filePath) {
      setFileName(fileName as string);
      setPreviewUrl(filePath);

      fetch(filePath)
      .then((res) => res.blob())
      .then((blob) => {
        const restoredFile = new File([blob], fileName, { type: blob.type });
        setSelectedFile(restoredFile);
      });
    }
  }, [])

  useEffect(() => {
    const height = window.innerHeight * 0.6;
    setEditorHeight(`${height}px`);
    const tags = window.localStorage.getItem("tags")
    if(tags) {
      setAddedTags(tags.split(","))
    }
  }, []);

  useEffect(() => {
    if(titleModel.length > 0 && descriptionModel.length > 0 && selectedFile) {
      setDisabled(false);
    } 
  }, [titleModel, descriptionModel, selectedFile])

  useEffect(() => {
    if(typeof window !== "undefined") {
      window.localStorage.setItem("tags", tagsAdded.join(","))
    }
  }, [tagsAdded])

  if(editPostId) {
    useEffect(() => {
      try {
        const getPost = async () => {
          const {editPost} = (await axios.get(`/api/${editPostId}/get`)).data
          const div = document.createElement("div")
          div.innerHTML = editPost.title
          setTitleModel(div.textContent || div.innerText || "")
          div.innerHTML = editPost.description
          setDescriptionModel(div.textContent || div.innerText || "")
          setPreviewUrl(editPost.image)
          setAddedTags(editPost.tags)
        }
        getPost()
      } catch (error) {
        console.log("Error:", error)
      }
    }, [editPostId])
  }

  const router = useRouter()
  const {data: session} = useSession()

  function htmlToText(html: string) {
    return new DOMParser().parseFromString(html, "text/html").body.textContent;
  }
    
    const handleCreatePost = async () => {
      if(htmlToText(titleModel)?.length === 0) {
        toast.warning("Title is required");
        return;
      }

      if(htmlToText(descriptionModel)?.length === 0) {
        toast.warning("Description is required");
        return;
      }

      const formData = new FormData();
      formData.append("title", titleModel);
      formData.append("description", descriptionModel);
      if(selectedFile) formData.append("file", selectedFile);
      if(tags) formData.append("tags", tagsAdded.join(","))

      setIsSubmitting(true);
      setDisabled(true)
      try {
        const response = await axios.post<APIResponse>(`/api/create-post?edit=${editPostId}`,
          formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            }
          }
        );
        if(!response.data.success) {
          toast.error("error", response.data.message)
        } 
        toast.success("success", {
          description: response.data.message,
        })
        window.localStorage.removeItem("postTitle");
        window.localStorage.removeItem("postDescription");
        window.localStorage.removeItem("fileName");
        window.localStorage.removeItem("filePath");
        window.localStorage.removeItem("tags")
      } catch (error) {
        const axiosError = error as AxiosError<APIResponse>
        toast.error("Error", axiosError.response?.data.message)
        console.error("Failed to create post", error);
      } finally {
        router.replace(`/dashboard/${session?.user?._id}`)
        setIsSubmitting(false);
      }
    }

  if (!editorHeight) {
    return <Loader2 className="w-4 h-4 animate-spin" />;
  }

  const handleFileUpload = (e: any) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if(!file) return
      setSelectedFile(file);
      setFileName(file.name);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        window.localStorage.setItem("filePath", base64String);
        window.localStorage.setItem("fileName", file.name);
        setPreviewUrl(base64String);
      };
    }
  };

  const addTag = (tag: string) => {
    setOpenTagsMenu(true)
    setInputValue("")
    setAddedTags((prev) => {
    setPostTags((prev) => prev.filter((prevTag) => prevTag !== tag))
      return [...prev, tag] 
    })
  }

    return (
    <div className="bg-gray-200 flex flex-col gap-5 items-center dark:bg-slate-950">   
      <div className="w-[80%] mt-5">
        <Label className="text-xl py-1">Title</Label>
        {titleAlert && <p className="text-red-600 text-center text-lg">{titleAlert}</p>}
        <FroalaEditor
          model={titleModel}
          onModelChange={(e: string) => setTitleModel(e)}
          config={{
            placeholderText: "Title...",
            charCounterCount: true,
            charCounterMax: 100,
            saveInterval: 3000,
            fontSizeDefaultSelection: "24",
            fontSizeUnit: "px",
            toolbarButtons: [
              "bold",
              "italic",
              "underline",
              "strikeThrough",
              "subscript",
              "superscript",
            ],
              events: {
              "charCounter.exceeded": function () {
                setTitleAlert("You have exceeded word limit");
              },
              "save.before": function (html: string) {
                window.localStorage.setItem("postTitle", html);
              },
            },
          }}
        />
      </div>
      <div className="w-[80%] m-5">
        <Label className="text-xl py-1">Description</Label>
        {descriptionAlert && <p className="text-red-600 text-center text-lg">{descriptionAlert}</p>}
        <FroalaEditor
          model={descriptionModel}      
          onModelChange={(e: string) => setDescriptionModel(e)}
          config={{
            placeholderText: "Start writing your blog...",
            charCounterCount: true,
            charCounterMax: 3000,
            saveInterval: 3000,
            fontSizeDefaultSelection: "20",
            fontSizeUnit: "px",
            height: editorHeight,
            events: {
              "charCounter.exceeded": function () {
                setDescriptionAlert("You have exceeded word limit");
              },
              "save.before": function (html: string) {
                window.localStorage.setItem("postDescription", html);
              },
            },
          }}
        />
        <div className="flex gap-10 mt-4 py-1">
        <div className="w-[30%]">
          <Label className="text-xl mb-2">Tags</Label>
          <Input className="border-gray-400 border-[0.8px] shadow-md text-xl" placeholder="Enter tags" onFocus={() => setOpenTagsMenu(true)} onClick={() => setOpenTagsMenu(true)}  
          onChange={(e) => {
            setInputValue(e.target.value)
            setOpenTagsMenu(true)
          }} 
          value={inputValue}
          onKeyDown={async (e) => {
            if(e.key === "Enter") {
              setAddedTags((prev) => [...prev, inputValue.trim()])
              if(!tags.includes(inputValue.trim())) {
                tags.push(inputValue.trim())
                const response = await axios.post("/api/tags/add", {
                  newTag: inputValue
                }, {
                  headers: {
                    "Content-Type": "application/json"
                  }
                })
                setInputValue("")
                if(!response.data.success) {
                  return toast(response.data.message)
                }
                setOpenTagsMenu(true)
                return toast(response.data.message)
              }
            }
          }}
          />
            {
            openTagsMenu && 
              <ul className="bg-gray-300 dark:bg-gray-800 rounded-box z-1 mt-0.5 shadow-sm h-[200px] max-h-min overflow-auto" onMouseEnter={() => setOpenTagsMenu(true)} onMouseOver={() => setOpenTagsMenu(true)} onMouseLeave={() => setTimeout(() => setOpenTagsMenu(false), 500)}>
                {
                  postTags.map((tag, index) => (
                    <li key={index} className="hover:bg-gray-600 hover:text-gray-300 p-1 text-md rounded cursor-pointer" onMouseDown={() => addTag(tag)}>{tag}</li>
                  ))
                }
              </ul>
          }
          </div>
          <div className="mt-10 flex gap-2 flex-wrap">
            {
              tagsAdded.length > 0 
              ? tagsAdded.map((tag) => (
                <div className="badge shadow-md bg-blue-300 dark:bg-blue-800 dark:text-white py-4 px-2 text-[16px]">{tag}
                <div className="tooltip tooltip-info" data-tip="Delete Tag">
                <X className="h-5" color="red" size={18} onClick={() => {
                  setAddedTags((prev) => prev.filter((prevTag) => prevTag !== tag))
                  setPostTags((prev) => [...prev, tag])
                }} /></div>
                </div>
              ))
              : null
            }
          </div>
          </div>
        </div>
        <div className="mt-4 py-1 w-[80%]">
          <div
          >
            <div>
              <Label className="text-xl mb-2">Thumbnail</Label>

              <Label className="text-white bg-gray-500 rounded-md text-lg flex justify-between h-12"> 
              <div className="flex gap-2 items-center h-[100%]">
                <p className="bg-gray-700 rounded-md h-[100%] px-4 flex items-center">Choose file</p>
                <Input
                  type="file"
                  className="p-2 hidden border-r-4 border-green-700"
                  onChange={handleFileUpload}
                />
                <p className="text-md pl-4 text-gray-200">{fileName}</p>
            </div>
              <Button className="h-[100%] bg-transparent flex justify-center items-center w-12 rounded-md hover:bg-red-500" onClick={() => {
                setFileName("No files chosen")
                setPreviewUrl("")
                window.localStorage.removeItem("fileName")
                window.localStorage.removeItem("filePath")
                setSelectedFile(null)
              }}>
                <X />
              </Button>
            </Label>
              </div>
            <div>
              {previewUrl ? (
                <>
                  <div className="flex justify-center mt-10">
                  <Image
                    src={previewUrl}
                    alt="Thumbnail"
                    width={editPostId ? 1000 : 0}
                    height={editPostId ? 1000 : 0}
                    className="rounded-lg w-[350px] h-[200px] xl:w-[900px] xl:h-[500px]"
                  />
                  </div>
                </>
              ) : null}
            </div>
              <div className="text-center mt-5">
                  <Button onClick={handleCreatePost} className="text-3xl mb-4 bg-gray-600 hover:bg-gray-700 dark:bg-gray-200 dark:hover:bg-white w-[100%] cursor-pointer py-7 mt-5 rounded-lg disabled:bg-white" disabled={disabled}>
                  {
                    isSubmitting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    :<>
                    <span className="flex items-center gap-4">Publish <Upload /></span>
                    </> 
                  }
                  </Button>
            </div>
          </div>
        </div>
    </div>
  );
}