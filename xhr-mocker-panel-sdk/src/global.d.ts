declare module 'lodash'
declare module '@/utils/*'
declare module '@/assets/*'
declare module '*.less' {

  const content: { [className: string]: string };

  export default content;

}
