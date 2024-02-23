import { Fragment } from 'react';

import * as runtime from 'react/jsx-runtime';
import { runSync } from '@mdx-js/mdx';
import MDXComponents from './MDXComponents';

function MDXRenderer({ code }: { code: string }) {
  const { default: MdxModuleComponent } = runSync(code, {
    ...runtime,
    baseUrl: import.meta.url,
    Fragment,
  });

  return <MdxModuleComponent />;
}

export default MDXRenderer;
