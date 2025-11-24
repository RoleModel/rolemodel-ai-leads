"use client";

import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type InlineCitationProps = ComponentProps<"span">;

export const InlineCitation = ({
  style,
  ...props
}: InlineCitationProps) => (
  <span
    style={{
      display: 'inline',
      alignItems: 'center',
      gap: 'var(--op-space-x-small)',
      ...style
    }}
    {...props}
  />
);

export type InlineCitationTextProps = ComponentProps<"span">;

export const InlineCitationText = ({
  style,
  ...props
}: InlineCitationTextProps) => (
  <span
    style={{
      transition: 'background-color 0.2s',
      ...style
    }}
    {...props}
  />
);

export type InlineCitationCardProps = ComponentProps<typeof HoverCard>;

export const InlineCitationCard = (props: InlineCitationCardProps) => (
  <HoverCard closeDelay={0} openDelay={0} {...props} />
);

export type InlineCitationCardTriggerProps = ComponentProps<typeof Badge> & {
  sources: string[];
};

export const InlineCitationCardTrigger = ({
  sources,
  style,
  ...props
}: InlineCitationCardTriggerProps) => (
  <HoverCardTrigger asChild>
    <Badge
      style={{
        marginLeft: 'var(--op-space-2x-small)',
        borderRadius: '999px',
        ...style
      }}
      variant="outline"
      {...props}
    >
      {sources[0] ? (
        <>
          {new URL(sources[0]).hostname}{" "}
          {sources.length > 1 && `+${sources.length - 1}`}
        </>
      ) : (
        "unknown"
      )}
    </Badge>
  </HoverCardTrigger>
);

export type InlineCitationCardBodyProps = ComponentProps<"div">;

export const InlineCitationCardBody = ({
  style,
  ...props
}: InlineCitationCardBodyProps) => (
  <HoverCardContent
    style={{
      position: 'relative',
      width: '280px',
      padding: 0,
      backgroundColor: 'var(--op-color-background)',
      overflow: 'hidden',
      boxShadow: 'var(--op-shadow-medium)',
      ...style
    }}
    {...props}
  />
);

const CarouselApiContext = createContext<CarouselApi | undefined>(undefined);

const useCarouselApi = () => {
  const context = useContext(CarouselApiContext);
  return context;
};

export type InlineCitationCarouselProps = ComponentProps<typeof Carousel>;

export const InlineCitationCarousel = ({
  style,
  children,
  ...props
}: InlineCitationCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();

  return (
    <CarouselApiContext.Provider value={api}>
      <Carousel style={{ width: '100%', boxShadow: 'var(--op-shadow-medium)', ...style }} setApi={setApi} {...props}>
        {children}
      </Carousel>
    </CarouselApiContext.Provider>
  );
};

export type InlineCitationCarouselContentProps = ComponentProps<"div">;

export const InlineCitationCarouselContent = (
  props: InlineCitationCarouselContentProps
) => <CarouselContent {...props} />;

export type InlineCitationCarouselItemProps = ComponentProps<"div">;

export const InlineCitationCarouselItem = ({
  style,
  ...props
}: InlineCitationCarouselItemProps) => (
  <CarouselItem
    style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--op-space-small)',
      padding: 'var(--op-space-medium)',
      backgroundColor: 'var(--op-color-background)',
      ...style
    }}
    {...props}
  />
);

export type InlineCitationCarouselHeaderProps = ComponentProps<"div">;

export const InlineCitationCarouselHeader = ({
  style,
  ...props
}: InlineCitationCarouselHeaderProps) => {
  const api = useCarouselApi();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
  }, [api]);

  if (count <= 1) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--op-space-small)',
        backgroundColor: 'var(--op-color-neutral-plus-six)',
        padding: 'var(--op-space-small) var(--op-space-medium)',
        borderBottom: '1px solid var(--op-color-border)',
        ...style
      }}
      {...props}
    />
  );
};

export type InlineCitationCarouselIndexProps = ComponentProps<"div">;

export const InlineCitationCarouselIndex = ({
  children,
  style,
  ...props
}: InlineCitationCarouselIndexProps) => {
  const api = useCarouselApi();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 'var(--op-space-x-small) var(--op-space-medium)',
        color: 'var(--op-color-neutral-on-plus-max)',
        fontSize: 'var(--op-font-x-small)',
        ...style
      }}
      {...props}
    >
      {children ?? `${current}/${count}`}
    </div>
  );
};

export type InlineCitationCarouselPrevProps = ComponentProps<"button">;

export const InlineCitationCarouselPrev = ({
  style,
  ...props
}: InlineCitationCarouselPrevProps) => {
  const api = useCarouselApi();

  const handleClick = useCallback(() => {
    if (api) {
      api.scrollPrev();
    }
  }, [api]);

  return (
    <button
      aria-label="Previous"
      style={{
        flexShrink: 0,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 'var(--op-space-x-small)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--op-color-neutral-on-plus-max)',
        ...style
      }}
      onClick={handleClick}
      type="button"
      {...props}
    >
      <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
    </button>
  );
};

export type InlineCitationCarouselNextProps = ComponentProps<"button">;

export const InlineCitationCarouselNext = ({
  style,
  ...props
}: InlineCitationCarouselNextProps) => {
  const api = useCarouselApi();

  const handleClick = useCallback(() => {
    if (api) {
      api.scrollNext();
    }
  }, [api]);

  return (
    <button
      aria-label="Next"
      style={{
        flexShrink: 0,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 'var(--op-space-x-small)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--op-color-neutral-on-plus-max)',
        ...style
      }}
      onClick={handleClick}
      type="button"
      {...props}
    >
      <ArrowRightIcon style={{ width: '16px', height: '16px' }} />
    </button>
  );
};

export type InlineCitationSourceProps = ComponentProps<"div"> & {
  title?: string;
  url?: string;
  description?: string;
};

export const InlineCitationSource = ({
  title,
  url,
  description,
  style,
  children,
  ...props
}: InlineCitationSourceProps) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--op-space-x-small)',
      ...style
    }}
    {...props}
  >
    {title && (
      <h4 style={{
        margin: 0,
        fontSize: 'var(--op-font-small)',
        fontWeight: 'var(--op-font-weight-medium)',
        lineHeight: 1.2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {title}
      </h4>
    )}
    {url && (
      <p style={{
        margin: 0,
        fontSize: 'var(--op-font-x-small)',
        color: 'var(--op-color-neutral-on-plus-max)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        wordBreak: 'break-all',
      }}>
        {url}
      </p>
    )}
    {description && (
      <p style={{
        margin: 0,
        fontSize: 'var(--op-font-small)',
        color: 'var(--op-color-neutral-on-plus-max)',
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {description}
      </p>
    )}
    {children}
  </div>
);

export type InlineCitationQuoteProps = ComponentProps<"blockquote">;

export const InlineCitationQuote = ({
  children,
  style,
  ...props
}: InlineCitationQuoteProps) => (
  <blockquote
    style={{
      borderLeft: '2px solid var(--op-color-border)',
      paddingLeft: 'var(--op-space-medium)',
      color: 'var(--op-color-neutral-on-plus-max)',
      fontSize: 'var(--op-font-small)',
      fontStyle: 'italic',
      margin: 0,
      ...style
    }}
    {...props}
  >
    {children}
  </blockquote>
);
