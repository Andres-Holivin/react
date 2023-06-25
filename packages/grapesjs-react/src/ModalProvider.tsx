import React, { createElement, useState, useEffect } from 'react';
import { useEditorInstance } from './context/EditorInstance';
import { useEditorOptions } from './context/EditorOptions';
import { WrapDom } from './utils/react';

export interface ModalState {
    /**
     * Modal title
     */
    title: React.ReactElement,

    /**
     * Modal content
     */
    content: React.ReactElement,

    /**
     * Modal attributes
     */
    attributes: Record<string, any>,

    /**
     * Callback for closing the modal
     */
    close: () => void,
}

export interface ResultProps extends ModalState {
    /**
     * Indicates if the modal is open.
     */
     open: boolean,
}

export interface ModalProvider {
    children: ((props: ResultProps) => React.JSX.Element),
}

export interface ModalEventProps {
    open: boolean,
    title: string | HTMLElement,
    content: string | HTMLElement,
    attributes: Record<string, any>,
    close: () => void,
}

export default function ModalProvider({ children }: ModalProvider) {
    const { editor } = useEditorInstance();
    const options = useEditorOptions();
    const [isOpen, setOpen] = useState(false);
    const [modalState, setModalState] = useState<ModalState>({
        title: <></>,
        content: <></>,
        attributes: {},
        close: () => {}
    });

    useEffect(() => {
        if (!editor) return;
        const event = 'modal';

        const toListen = ({ open, title, content, close, attributes }: ModalEventProps) => {
            open && setModalState({
                title: createElement(WrapDom(title)),
                content: createElement(WrapDom(content)),
                attributes,
                close,
            });
            setOpen(open);
        }

        editor.on(event, toListen);

        return () => {
            editor.off(event, toListen)
        };
    }, [editor]);

    useEffect(() => options.setCustomModal(true), []);

    return editor ?
        (typeof children === 'function' ? children({ open: isOpen, ...modalState })  : null)
    : null;
  }