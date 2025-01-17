import React, { ForwardedRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Select, Space, Dropdown, MenuProps, Spin } from 'antd';
import { AlignLeftOutlined, DownOutlined } from '@ant-design/icons';
import Editor, { loader } from '@monaco-editor/react';
loader.config({
  paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs' }
});
// @ts-ignore
// import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// @ts-ignore
// import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// editor.all中可查看完整的
// import 'monaco-editor/esm/vs/language/json/monaco.contribution'; // 代码高亮&提示
// import 'monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu.js'; // 右键显示菜单
// import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js'; // 折叠
// import 'monaco-editor/esm/vs/editor/contrib/format/browser/formatActions.js'; // 格式化代码
// import 'monaco-editor/esm/vs/editor/contrib/comment/browser/comment.js'; // 注释
// import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController.js'; // 搜索
import './index.css';

interface MonacoEditorProps {
  languageSelectOptions?: string[];
  editorHeight?: number | string;
  language?: string;
  text?: string;
  examples?: ExampleItem[];
  theme?: string;
  headerLeftNode?: React.ReactNode,
  headerRightNode?: React.ReactNode,
  headerRightRightNode?: React.ReactNode,
  headerStyle?: object
  onDidChangeContent?: (arg0: string) => void
  onSaveKeyword?: (arg0: any) => void
}
type ExampleItem = {
  egTitle?: string,
  egText?: string,
  egType: number
}
const MonacoEditor = (props: MonacoEditorProps, ref: ForwardedRef<{ editorInstance: any }>) => {
  const {
    languageSelectOptions = ['json'],
    examples = [],
    theme = 'vs-dark',
    headerStyle,
    headerLeftNode,
    headerRightNode,
    headerRightRightNode,
    text,
  } = props;
  const [language, setLanguage] = useState<string>(props.language || 'json')
  const [value, setValue] = useState(text)
  const editorRef = useRef<any>(null);
  // const monaco = useMonaco();
  useImperativeHandle(ref, () => ({
    editorInstance: editorRef,
    formatDocumentAction
  }))

  useEffect(()=>{
    setValue(text)
  },[text])

  useEffect(()=>{
    if(value)
      formatDocumentAction(true)
  },[value])

  // 格式化代码
  const formatDocumentAction = (isResetPostion: boolean = false) => {
    const editor = editorRef.current;
    editor?.getAction('editor.action.formatDocument').run();
    if (isResetPostion) {
      setTimeout(()=>{
        editor?.setScrollTop(0);
      },100)
    }
  };

  const onLanguageChange = (_language: string) => {
    setLanguage(_language);
  };
  const onAddExampleClick = (eg: ExampleItem) => {
    if(eg.egType == 1) {
      setValue(eg.egText);
    }
  };
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    setTimeout(() => {
      formatDocumentAction()
    }, 500)
  };
  const items: MenuProps['items'] = examples.map((eg, index) => {
    return {
      key: index,
      label: <div onClick={() => onAddExampleClick(eg)}>{eg.egTitle}</div>,
    };
  });
  return <>
    <div className="mock-sdk-monaco-editor-container">
      <header className="mock-sdk-monaco-editor-header" style={headerStyle}>
        <div>
          {
            languageSelectOptions.length > 0 ? <Select
              size="small"
              value={language}
              onChange={onLanguageChange}
              className="mock-sdk-monaco-language-select"
            >
              {
                languageSelectOptions.map((lang) => <Select.Option key={lang} value={lang}>{lang}</Select.Option>)
              }
            </Select> : null
          }
          {headerLeftNode}
        </div>
        <div>
          <Space size={16}>
            {headerRightNode}
            {
              examples.length > 1 ? <Dropdown menu={{ items }}>
                <a onClick={(e) => e.preventDefault()}>
                  <Space size={4}>
                    Example
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown> : <a
                title="Example Case"
                onClick={() => onAddExampleClick(examples[0])}
              >
                Example
              </a>
            }
            <AlignLeftOutlined
              title="Format Document"
              onClick={() => formatDocumentAction()}
            />
            {headerRightRightNode}
          </Space>
        </div>
      </header>
      <Editor
        defaultLanguage={'json'}
        language={language}
        theme={theme}
        loading={<Spin />}
        value={value}
        onMount={handleEditorDidMount}
      >
      </Editor>
    </div>
  </>
};
export default React.memo(React.forwardRef(MonacoEditor))
