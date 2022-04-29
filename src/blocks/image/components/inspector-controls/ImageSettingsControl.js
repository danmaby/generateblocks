import { __ } from '@wordpress/i18n';
import getIcon from '../../../../utils/get-icon';
import PanelArea from '../../../../components/panel-area';
import { TextareaControl, TextControl, SelectControl, BaseControl } from '@wordpress/components';
import NumberControl from '../../../../components/number-control';
import getAttribute from '../../../../utils/get-attribute';
import getMediaUrl from '../../../../utils/get-media-url';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

export default function ImageSettingsControls( props ) {
	const {
		state,
		attributes,
		setAttributes,
		media,
		deviceType,
	} = props;

	const {
		useDynamicData,
		mediaId,
		alt,
		title,
		sizeSlug,
		width,
		height,
		mediaUrl,
	} = attributes;

	const mediaData = useSelect( ( select ) => {
		const { getMedia } = select( coreStore );

		return mediaId && getMedia( mediaId, { context: 'view' } );
	}, [ useDynamicData, mediaId ] );

	const imageSizes = useSelect( ( select ) => {
		const {
			getSettings,
		} = select( blockEditorStore );

		const sizes = getSettings().imageSizes || [];
		return sizes.map( ( size ) => ( { value: size.slug, label: size.name } ) );
	}, [] );

	return (
		<PanelArea
			{ ...props }
			title={ __( 'Settings', 'generateblocks' ) }
			initialOpen={ false }
			icon={ getIcon( 'backgrounds' ) }
			className={ 'gblocks-panel-label' }
			id={ 'imageSettings' }
			state={ state }
		>
			{
				'Desktop' === deviceType &&
				(
					!! mediaId ||
					useDynamicData
				) &&
				<SelectControl
					label={ __( 'Size', 'generateblocks' ) }
					value={ sizeSlug }
					options={ imageSizes }
					onChange={ ( value ) => {
						setAttributes( {
							sizeSlug: value,
						} );

						const imageUrl = getMediaUrl( mediaData, value ) || mediaUrl;
						let newWidth = mediaData?.media_details?.sizes[ value ]?.width || width;
						let newHeight = mediaData?.media_details?.sizes[ value ]?.height || height;

						/**
						 * We can't get specific image data for dynamic images, so we'll use the
						 * available sizing options for each sizeSlug.
						 */
						if ( useDynamicData ) {
							newWidth = '';
							newHeight = '';
						}

						setAttributes( {
							mediaUrl: imageUrl,
							width: newWidth,
							height: newHeight,
						} );
					} }
				/>
			}

			<BaseControl
				help={ __( 'These fields will resize the image using CSS.', 'generateblocks' ) }
			>
				<div className="gblocks-image-dimensions__row">
					<NumberControl
						{ ...props }
						label={ __( 'Width', 'generateblocks' ) }
						id="gblocks-image-width"
						attributeName="width"
						device={ deviceType }
						units={ [ 'px' ] }
						min="1"
					/>

					<NumberControl
						{ ...props }
						label={ __( 'Height', 'generateblocks' ) }
						id="gblocks-image-height"
						attributeName="height"
						device={ deviceType }
						units={ [ 'px' ] }
						min="1"
					/>
				</div>
			</BaseControl>

			<SelectControl
				label={ __( 'Object-fit', 'generateblocks' ) }
				value={ getAttribute( 'objectFit', props ) }
				options={ [
					{
						label: __( 'Select…', 'generateblocks' ),
						value: '',
					},
					{
						label: __( 'Inherit', 'generateblocks' ),
						value: 'inherit',
					},
					{
						label: __( 'Cover', 'generateblocks' ),
						value: 'cover',
					},
					{
						label: __( 'Contain', 'generateblocks' ),
						value: 'contain',
					},
					{
						label: __( 'Fill', 'generateblocks' ),
						value: 'fill',
					},
					{
						label: __( 'None', 'generateblocks' ),
						value: 'none',
					},
				] }
				onChange={ ( value ) => {
					setAttributes( {
						[ getAttribute( 'objectFit', props, true ) ]: value,
					} );
				} }
			/>

			{ ! useDynamicData && mediaId &&
				<>
					<TextareaControl
						label={ __( 'Alt text (alternative text)', 'generateblocks' ) }
						help={ __( 'Describe the purpose of the image, leave empty if the image is purely decorative.', 'generateblocks' ) }
						value={ useDynamicData ? media?.alt_text : alt }
						disabled={ useDynamicData }
						onChange={ ( value ) => (
							setAttributes( { alt: value } )
						) }
					/>

					<TextControl
						label={ __( 'Title attribute', 'generateblocks' ) }
						help={ __( 'Describe the role of this image on the page.', 'generateblocks' ) }
						value={ useDynamicData ? media?.title?.rendered : title }
						disabled={ useDynamicData }
						onChange={ ( value ) => (
							setAttributes( { title: value } )
						) }
					/>
				</>
			}
		</PanelArea>
	);
}
