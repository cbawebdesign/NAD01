import Image from 'next/image';
import classNames from 'clsx';
import { forwardRef } from 'react';

import Alert from '~/core/ui/Alert';
import configuration from '~/configuration';

import LazyRender from '~/core/ui/LazyRender';
import ClientOnly from '~/core/ui/ClientOnly';

const NextImage = forwardRef<
  React.ElementRef<'img'>,
  React.ComponentPropsWithoutRef<'img'> & {
    class: string;
  }
>(function ImageComponent(props) {
  const className = classNames(props.class, `object-cover`);

  return (
    <Image
      className={className}
      src={props.src as string}
      alt={props.alt as string}
    />
  );
});

const ExternalLink = ({
  href,
  children,
}: React.PropsWithChildren<{
  href: string;
}>) => {
  const siteUrl = configuration.site.siteUrl ?? '';
  const isRoot = href[0] === '/';
  const isInternalLink = href.startsWith(siteUrl) || isRoot;

  if (isInternalLink) {
    return <a href={href}>{children}</a>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

const Video: React.FCC<{
  src: string;
  width?: string;
  type?: string;
}> = ({ src, type, width }) => {
  const useType = type ?? 'video/mp4';

  return (
    <ClientOnly>
      <LazyRender rootMargin={'-200px 0px'}>
        <video
          className="my-4"
          width={width ?? `100%`}
          height="auto"
          playsInline
          autoPlay
          muted
          loop
        >
          <source src={src} type={useType} />
        </video>
      </LazyRender>
    </ClientOnly>
  );
};

const MDXComponents = {
  img: NextImage,
  a: ExternalLink,
  Video,
  Alert,
  Image: NextImage,
};

export default MDXComponents;
