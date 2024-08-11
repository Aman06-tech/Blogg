import { Button, FileInput, Select, TextInput } from "flowbite-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function CreatePost() {
  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-mono text-cyan-500">
        Create a post
      </h1>
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title "
            required
            id="title"
            className="flex-1"
          />
          <Select>
            <option value="uncategorized">Select category</option>
            <option value="personalblogg">Personal Blogg</option>
            <option value="professionalblogg">Professional Blogg</option>
            <option value="Educational blogg">Educational Blogg</option>
            <option value="newsandcurrentaffairs blogg">
              News and Current Affairs Blogg
            </option>
            <option value="techblogg">Tech Blogg</option>
            <option value="creativewrittingblogg">
              Creative Writing Blogg
            </option>
            <option value="multimediablogg">Multimedia Blogg</option>
            <option value="climateblogg">Climate Blogg</option>
            <option value="medicalblogg">Medical Blogg</option>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-cyan-500 border-double p-3">
          <FileInput type="file" accept="images/*" />
          <Button type="button" gradientDuoTone="greenToBlue" size="sm" outline>
            Upload image
          </Button>
        </div>
        <ReactQuill theme="snow" placeholder="Write your content" className="h-72 mb-12" required/>
        <Button type="submit" gradientDuoTone='purpleToPink' >Publish</Button>
      </form>
    </div>
  );
}
