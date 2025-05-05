import { supabase } from '../lib/supabase';

const sampleImages = [
  {
    name: 'classic-tee.jpg',
    url: '/sample-images/classic-tee.jpg'
  },
  {
    name: 'worship-tee.jpg',
    url: '/sample-images/worship-tee.jpg'
  },
  {
    name: 'youth-tee.jpg',
    url: '/sample-images/youth-tee.jpg'
  },
  {
    name: 'sunday-tee.jpg',
    url: '/sample-images/sunday-tee.jpg'
  },
  {
    name: 'prayer-tee.jpg',
    url: '/sample-images/prayer-tee.jpg'
  },
  {
    name: 'choir-tee.jpg',
    url: '/sample-images/choir-tee.jpg'
  }
];

export async function uploadSampleImages() {
  for (const image of sampleImages) {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      
      const { error } = await supabase.storage
        .from('shop')
        .upload(`products/${image.name}`, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.error(`Error uploading ${image.name}:`, error);
      } else {
        console.log(`Successfully uploaded ${image.name}`);
        
        // Update product with correct image URL
        const { data: publicUrl } = supabase.storage
          .from('shop')
          .getPublicUrl(`products/${image.name}`);

        await supabase
          .from('products')
          .update({ image_url: publicUrl.publicUrl })
          .eq('name', image.name.replace('.jpg', ''));
      }
    } catch (error) {
      console.error(`Error processing ${image.name}:`, error);
    }
  }
}